"""
Мета-модель для выбора и комбинирования базовых моделей
Двухслойная архитектура:
1. Базовые модели (RF, GB, XGBoost)
2. Мета-уровень для выбора модели по монете и режиму рынка
"""
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from datetime import datetime

logger = logging.getLogger(__name__)

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False


class MarketRegimeDetector:
    """Определяет режим рынка: тренд/флэт/паника"""
    
    def __init__(self):
        self.volatility_threshold_high = 0.03
        self.volatility_threshold_low = 0.01
        self.trend_threshold = 0.5
    
    def detect_regime(self, data: pd.DataFrame) -> str:
        """
        Определяет режим рынка на основе последних данных
        
        Returns:
            'trend' - тренд
            'flat' - флэт
            'volatile' - высокая волатильность/паника
        """
        if data.empty or len(data) < 20:
            return 'flat'
        
        recent = data.tail(20)
        
        if 'volatility' in recent.columns:
            volatility = recent['volatility'].mean()
        else:
            price_changes = recent['close'].pct_change().abs()
            volatility = price_changes.mean()
        
        current_price = recent['close'].iloc[-1]
        volatility_pct = volatility / current_price if current_price > 0 else 0
        
        if 'sma10' in recent.columns and 'sma20' in recent.columns:
            sma10 = recent['sma10'].iloc[-1]
            sma20 = recent['sma20'].iloc[-1]
            price = recent['close'].iloc[-1]
            
            distance_to_sma = abs(price - sma20) / sma20 if sma20 > 0 else 0
            
            if sma10 > sma20 and distance_to_sma > 0.015:
                trend_strength = 'up'
            elif sma10 < sma20 and distance_to_sma > 0.015:
                trend_strength = 'down'
            else:
                trend_strength = 'sideways'
        else:
            trend_strength = 'sideways'
            distance_to_sma = 0
        
        if 'rsi14' in recent.columns:
            rsi = recent['rsi14'].iloc[-1]
            rsi_extreme = rsi > 75 or rsi < 25
        else:
            rsi_extreme = False
        
        if volatility_pct > self.volatility_threshold_high or rsi_extreme:
            return 'volatile'
        elif trend_strength != 'sideways' and distance_to_sma > 0.015:
            return 'trend'
        elif volatility_pct < self.volatility_threshold_low:
            return 'flat'
        else:
            return 'flat'
    
    def get_regime_features(self, data: pd.DataFrame) -> np.ndarray:
        """Извлекает признаки режима рынка"""
        if data.empty or len(data) < 20:
            return np.array([0.0, 0.0, 0.0, 0.0])
        
        recent = data.tail(20)
        
        volatility = recent['volatility'].mean() if 'volatility' in recent.columns else 0.0
        
        if 'sma10' in recent.columns and 'sma20' in recent.columns:
            sma10 = recent['sma10'].iloc[-1]
            sma20 = recent['sma20'].iloc[-1]
            price = recent['close'].iloc[-1]
            distance_to_sma = abs(price - sma20) / sma20 if sma20 > 0 else 0
            trend_direction = 1.0 if sma10 > sma20 else -1.0
        else:
            distance_to_sma = 0.0
            trend_direction = 0.0
        
        volume = recent['volume'].mean() if 'volume' in recent.columns else 0.0
        volume_normalized = min(volume / 1000000, 1.0) if volume > 0 else 0.0
        
        return np.array([volatility, distance_to_sma, trend_direction, volume_normalized])


class ModelPerformanceTracker:
    """Отслеживает производительность моделей по монетам и режимам"""
    
    def __init__(self):
        self.performance: Dict[str, Dict[str, Dict]] = {}  # {symbol: {model_name: {regime: stats}}}
    
    def update(self, symbol: str, model_name: str, regime: str, 
               return_pct: float, trades: int, win_rate: float):
        """Обновляет статистику производительности"""
        if symbol not in self.performance:
            self.performance[symbol] = {}
        if model_name not in self.performance[symbol]:
            self.performance[symbol][model_name] = {}
        
        if regime not in self.performance[symbol][model_name]:
            self.performance[symbol][model_name][regime] = {
                'returns': [],
                'trades': [],
                'win_rates': []
            }
        
        self.performance[symbol][model_name][regime]['returns'].append(return_pct)
        self.performance[symbol][model_name][regime]['trades'].append(trades)
        self.performance[symbol][model_name][regime]['win_rates'].append(win_rate)
    
    def get_best_model(self, symbol: str, regime: str) -> Optional[str]:
        """Возвращает лучшую модель для символа и режима"""
        if symbol not in self.performance:
            return None
        
        best_model = None
        best_avg_return = float('-inf')
        
        for model_name, regimes in self.performance[symbol].items():
            if regime in regimes:
                returns = regimes[regime]['returns']
                if returns:
                    avg_return = np.mean(returns)
                    if avg_return > best_avg_return:
                        best_avg_return = avg_return
                        best_model = model_name
        
        return best_model
    
    def get_model_weights(self, symbol: str, regime: str) -> Dict[str, float]:
        """Возвращает веса моделей для ансамбля"""
        if symbol not in self.performance:
            return {}
        
        weights = {}
        total_performance = 0.0
        
        for model_name, regimes in self.performance[symbol].items():
            if regime in regimes:
                returns = regimes[regime]['returns']
                if returns:
                    avg_return = np.mean(returns)
                    performance = max(avg_return, 0.0)
                    weights[model_name] = performance
                    total_performance += performance
        
        if total_performance > 0:
            weights = {k: v / total_performance for k, v in weights.items()}
        else:
            n_models = len(weights)
            if n_models > 0:
                weights = {k: 1.0 / n_models for k in weights.keys()}
        
        return weights


class BaseModelFactory:
    """Создает и обучает базовые модели"""
    
    @staticmethod
    def create_random_forest() -> RandomForestClassifier:
        """Создает RandomForest с консервативными параметрами"""
        return RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
            class_weight='balanced'
        )
    
    @staticmethod
    def create_gradient_boosting() -> GradientBoostingClassifier:
        """Создает GradientBoosting с консервативными параметрами для крипты"""
        return GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.05,
            max_depth=4,
            min_samples_split=10,
            min_samples_leaf=5,
            subsample=0.8,
            max_features=0.7,
            random_state=42
        )
    
    @staticmethod
    def create_xgboost():
        """Создает XGBoost с консервативными параметрами"""
        if not XGBOOST_AVAILABLE:
            return None
        
        return xgb.XGBClassifier(
            n_estimators=100,
            learning_rate=0.05,
            max_depth=4,
            min_child_weight=5,
            subsample=0.8,
            colsample_bytree=0.7,
            random_state=42,
            eval_metric='mlogloss'
        )


class MetaModelSelector:
    """Мета-модель для выбора и комбинирования базовых моделей"""
    
    def __init__(self):
        self.regime_detector = MarketRegimeDetector()
        self.performance_tracker = ModelPerformanceTracker()
        self.base_models: Dict[str, Dict] = {}  # {symbol: {model_name: model}}
        self.scalers: Dict[str, StandardScaler] = {}  # {symbol: scaler}
        self.model_factory = BaseModelFactory()
        
    
    def train_base_models(self, symbol: str, X: np.ndarray, y: np.ndarray):
        """Обучает все базовые модели для символа"""
        if symbol not in self.base_models:
            self.base_models[symbol] = {}
        
        if symbol not in self.scalers:
            self.scalers[symbol] = StandardScaler()
            X_scaled = self.scalers[symbol].fit_transform(X)
        else:
            X_scaled = self.scalers[symbol].transform(X)
        
        # RandomForest
        rf_model = self.model_factory.create_random_forest()
        rf_model.fit(X_scaled, y)
        self.base_models[symbol]['random_forest'] = rf_model
        
        # GradientBoosting
        gb_model = self.model_factory.create_gradient_boosting()
        gb_model.fit(X_scaled, y)
        self.base_models[symbol]['gradient_boosting'] = gb_model
        
        if XGBOOST_AVAILABLE:
            xgb_model = self.model_factory.create_xgboost()
            if xgb_model:
                xgb_model.fit(X_scaled, y)
                self.base_models[symbol]['xgboost'] = xgb_model
    
    def predict_ensemble(self, symbol: str, features: np.ndarray, 
                        data: pd.DataFrame, use_regime: bool = True) -> Tuple[int, float]:
        """
        Делает предсказание через ансамбль моделей
        
        Returns:
            (prediction, confidence) - предсказание и уверенность
        """
        if symbol not in self.base_models or not self.base_models[symbol]:
            logger.warning(f"No models trained for {symbol}")
            return None, 0.0
        
        regime = self.regime_detector.detect_regime(data) if use_regime else 'flat'
        
        if use_regime:
            if regime == 'trend':
                primary_model = 'gradient_boosting'
            elif regime == 'flat':
                primary_model = 'random_forest'
            elif regime == 'volatile':
                primary_model = 'random_forest'
            else:
                n_models = len(self.base_models[symbol])
                weights = {k: 1.0 / n_models for k in self.base_models[symbol].keys()}
                primary_model = None
            
            if primary_model and primary_model in self.base_models[symbol]:
                weights = {primary_model: 0.7}
                other_models = [m for m in self.base_models[symbol].keys() if m != primary_model]
                if other_models:
                    weight_per_other = 0.3 / len(other_models)
                    for model_name in other_models:
                        weights[model_name] = weight_per_other
                else:
                    weights = {primary_model: 1.0}
            elif not primary_model:
                pass
            else:
                n_models = len(self.base_models[symbol])
                weights = {k: 1.0 / n_models for k in self.base_models[symbol].keys()}
        else:
            n_models = len(self.base_models[symbol])
            weights = {k: 1.0 / n_models for k in self.base_models[symbol].keys()}
        
        if symbol in self.scalers:
            features_scaled = self.scalers[symbol].transform(features.reshape(1, -1))
        else:
            features_scaled = features.reshape(1, -1)
        
        predictions = []
        confidences = []
        model_weights = []
        
        for model_name, model in self.base_models[symbol].items():
            try:
                pred = model.predict(features_scaled)[0]
                proba = model.predict_proba(features_scaled)[0]
                confidence = float(max(proba))
                
                weight = weights.get(model_name, 0.0)
                
                predictions.append(pred)
                confidences.append(confidence)
                model_weights.append(weight)
            except Exception as e:
                logger.error(f"Error predicting with {model_name}: {e}")
                continue
        
        if not predictions:
            return None, 0.0
        
        weighted_votes = {0: 0.0, 1: 0.0, 2: 0.0}  # SELL, HOLD, BUY
        
        for pred, conf, weight in zip(predictions, confidences, model_weights):
            weighted_votes[pred] += conf * weight
        
        best_prediction = max(weighted_votes, key=weighted_votes.get)
        best_confidence = weighted_votes[best_prediction]
        
        return best_prediction, best_confidence
    
    def predict_ensemble_with_regime(self, symbol: str, features: np.ndarray, 
                                    data: pd.DataFrame, use_regime: bool = True) -> Tuple[int, float, str]:
        """
        Делает предсказание через ансамбль моделей и возвращает также режим рынка
        
        Returns:
            (prediction, confidence, regime) - предсказание, уверенность и режим рынка
        """
        prediction, confidence = self.predict_ensemble(symbol, features, data, use_regime)
        regime = self.regime_detector.detect_regime(data) if use_regime else 'flat'
        return prediction, confidence, regime
    
    def update_performance(self, symbol: str, model_name: str, regime: str,
                          return_pct: float, trades: int, win_rate: float):
        """Обновляет статистику производительности модели"""
        self.performance_tracker.update(symbol, model_name, regime, return_pct, trades, win_rate)
    
    def get_recommended_model(self, symbol: str, regime: str) -> str:
        """Возвращает рекомендуемую модель для символа и режима"""
        best_model = self.performance_tracker.get_best_model(symbol, regime)
        if best_model:
            return best_model
        
        return self.static_model_selection.get(symbol, 'random_forest')

