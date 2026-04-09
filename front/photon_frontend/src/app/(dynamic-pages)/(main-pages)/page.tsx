'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { T } from '@/components/ui/Typography';
import { SplineSceneBasic } from '@/components/ui/demo';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  MessageSquare,
  Play,
  TrendingUp,
  Zap,
  Shield,
  BarChart3,
  Users,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  return (
    <>
      {/* Navbar */}
      <nav className="w-full backdrop-blur-2xl bg-background/5 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground" style={{ fontFamily: "'Oceanwide Pro', sans-serif" }}>
                photon
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="#features">Features</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="#how-it-works">How It Works</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="#faq">FAQ</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="bg-gradient-primary" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent"></div>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-8 lg:mt-12">
              <div className="flex flex-col gap-6">
                <h1 className="text-6xl leading-tight text-left" style={{ fontFamily: 'var(--font-header), serif', fontWeight: 300 }}>
                  AI-Powered Trading.
                  <br />
                  <span className="text-[#4d74ff]">Human-Level Control.</span>
                </h1>
                <T.P className="max-w-[700px] text-left text-lg text-muted-foreground md:text-xl">
                  Three coordinated AI agents work 24/7 to monitor markets, make decisions, and execute trades—giving you automated intelligence with complete transparency.
                </T.P>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="bg-gradient-primary text-white" asChild>
                  <Link href="/login">
                    Try Demo <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#how-it-works">
                    <Play className="mr-2 h-4 w-4" /> Watch How It Works
                  </Link>
                </Button>
              </div>
            </div>
            <div className="order-first lg:order-none lg:ml-8 lg:-mt-20">
              <SplineSceneBasic />
            </div>
          </div>

          {/* Agent Communication Visualization */}
          <div className="mt-16 md:mt-28">
            <div className="relative w-full max-w-6xl mx-auto">
              <Card className="relative card-glass">
                <CardHeader>
                  <CardTitle className="text-center">Live Agent Communication</CardTitle>
                  <CardDescription className="text-center">
                    See how our agents coordinate in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-black border-[0.3px] border-[#4a4a4a]">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-blue flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Market Monitor Agent</p>
                        <p className="text-xs text-muted-foreground">
                          Detected 15% surge in BTC → Sent to Decision Maker
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">2s ago</div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-black border-[0.5px] border-[#4a4a4a]">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-yellow flex items-center justify-center">
                          <Brain className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Decision Maker Agent</p>
                        <p className="text-xs text-muted-foreground">
                          Confidence: 87% → BUY signal generated → Sent to Executor
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">1s ago</div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-black border-[0.5px] border-[#4a4a4a]">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-green flex items-center justify-center">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Executor Agent</p>
                        <p className="text-xs text-muted-foreground">
                          Trade executed in 0.2s → BTC +2.5% | Position opened
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">Just now</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section id="problem-solution" className="relative w-full py-20 md:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/active-trading-bg-crypto-1440.webp)',
          }}
        />
        <div className="container relative px-4 md:px-6 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="backdrop-blur-2xl bg-background/5 border border-border/50 rounded-lg p-8 md:p-12 lg:p-16">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                <div className="flex flex-col gap-6">
                  <Badge variant="outline" className="w-fit">
                    The Problem
                  </Badge>
                  <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                    Manual trading is slow, emotional, and error-prone
                  </T.H2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-2 w-2 rounded-full bg-destructive"></div>
                      </div>
                      <T.P className="text-muted-foreground">
                        Human traders miss opportunities due to sleep, emotions, and reaction time
                      </T.P>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-2 w-2 rounded-full bg-destructive"></div>
                      </div>
                      <T.P className="text-muted-foreground">
                        Manual analysis is time-consuming and prone to cognitive biases
                      </T.P>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-2 w-2 rounded-full bg-destructive"></div>
                      </div>
                      <T.P className="text-muted-foreground">
                        Execution delays can cost significant profits in volatile markets
                      </T.P>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <Badge variant="outline" className="w-fit bg-gradient-green/20 border-green-500/50">
                    Our Solution
                  </Badge>
                  <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                    Three coordinated AI agents work 24/7
                  </T.H2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <T.P className="text-muted-foreground">
                        Market Monitor continuously tracks 15+ exchanges and 2,450+ data points per minute
                      </T.P>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <T.P className="text-muted-foreground">
                        Decision Maker analyzes data with 87% average confidence, free from emotions
                      </T.P>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <T.P className="text-muted-foreground">
                        Executor places trades in 0.2 seconds with zero slippage
                      </T.P>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-12 text-center">
            <div className="space-y-4 max-w-[850px]">
              <Badge variant="outline" className="inline-flex">
                How It Works
              </Badge>
              <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Three-step visual flow
              </T.H2>
              <T.P className="text-lg text-muted-foreground md:text-xl">
                Watch how our agents communicate and coordinate to execute trades automatically
              </T.P>
            </div>

            <div className="w-full grid max-w-6xl gap-8 pt-8 sm:grid-cols-3 lg:gap-12">
              {[
                {
                  step: '1',
                  title: 'Market Monitor',
                  icon: BarChart3,
                  description: 'Monitors financial market data (prices, trends) and sends information to other agents',
                  gradient: 'bg-gradient-blue',
                },
                {
                  step: '2',
                  title: 'Decision Maker',
                  icon: Brain,
                  description: 'Analyzes received data and makes decisions: BUY, SELL, or HOLD',
                  gradient: 'bg-gradient-yellow',
                },
                {
                  step: '3',
                  title: 'Executor',
                  icon: Zap,
                  description: 'Executes the trade and records the action with full transparency',
                  gradient: 'bg-gradient-green',
                },
              ].map((item, index) => (
                <Card key={index} className="card-glass hover-lift">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-full ${item.gradient}`}>
                        <item.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Step {item.step}
                      </Badge>
                    </div>
                    <CardTitle className="text-center text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Communication Flow Visualization */}
            <div className="mt-12 w-full max-w-4xl">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-center">Agent Communication Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-4 p-6">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="h-12 w-12 rounded-full bg-gradient-blue flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-medium">Market Monitor</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="h-12 w-12 rounded-full bg-gradient-yellow flex items-center justify-center">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-medium">Decision Maker</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="h-12 w-12 rounded-full bg-gradient-green flex items-center justify-center">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-medium">Executor</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 rounded-lg bg-black border-[0.3px] border-[#4a4a4a]">
                    <p className="text-xs text-muted-foreground text-center">
                      Average latency: 0.5 seconds | Communication efficiency: 98%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section id="features" className="w-full py-20 md:py-32 bg-card/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-12 text-center">
            <div className="space-y-4 max-w-[850px]">
              <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Key Benefits
              </T.H2>
              <T.P className="text-lg text-muted-foreground md:text-xl">
                Why choose Photon for automated trading
              </T.P>
            </div>

            <div className="w-full grid max-w-6xl gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {[
                {
                  title: '24/7 Automated Monitoring',
                  description: 'Never miss an opportunity with continuous market surveillance',
                  icon: Clock,
                },
                {
                  title: 'Emotion-Free Decisions',
                  description: 'AI agents make rational decisions based on data, not fear or greed',
                  icon: Brain,
                },
                {
                  title: 'Reduced Latency',
                  description: 'Execute trades in milliseconds with zero human delay',
                  icon: Zap,
                },
                {
                  title: 'Multi-Exchange Support',
                  description: 'Trade across 15+ exchanges simultaneously from one platform',
                  icon: TrendingUp,
                },
                {
                  title: 'Complete Transparency',
                  description: 'See every decision, every communication, every trade',
                  icon: Shield,
                },
                {
                  title: 'Advanced Analytics',
                  description: 'Track performance, coordination metrics, and agent efficiency',
                  icon: BarChart3,
                },
                {
                  title: 'Risk Management',
                  description: 'Built-in stop-loss, position sizing, and risk limits',
                  icon: Shield,
                },
                {
                  title: 'Customizable Strategies',
                  description: 'Configure agents to match your trading style and risk tolerance',
                  icon: Cpu,
                },
              ].map((benefit, index) => (
                <Card key={index} className="card-glass hover-lift">
                  <CardHeader className="flex-none">
                    <div className="flex justify-center mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-center text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-start">
                    <CardDescription className="text-center text-sm">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-12">
            <div className="space-y-4 text-center max-w-[850px]">
              <Badge variant="outline" className="inline-flex">
                Frequently Asked Questions
              </Badge>
              <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Everything you need to know
              </T.H2>
            </div>

            <div className="w-full max-w-3xl space-y-4">
              {[
                {
                  question: 'Is it safe?',
                  answer: 'Yes. Photon uses bank-level encryption, secure API connections, and follows industry best practices. All trades are executed through regulated exchanges, and you maintain full control over your funds.',
                },
                {
                  question: 'How do I customize strategies?',
                  answer: 'You can choose from pre-built strategy templates (Conservative Growth, Momentum Trader, Arbitrage Hunter) or build your own custom strategy with our visual strategy builder. Configure risk tolerance, position sizing, stop-loss levels, and more.',
                },
                {
                  question: 'What\'s the minimum investment?',
                  answer: 'There\'s no minimum investment required. You can start with any amount you\'re comfortable with. However, we recommend starting with at least $100 to see meaningful results and cover trading fees.',
                },
                {
                  question: 'Can I see how agents communicate?',
                  answer: 'Absolutely! This is one of our key differentiators. Every trade decision shows the complete communication flow: what Market Monitor detected, why Decision Maker chose BUY/SELL/HOLD, and how Executor executed the trade. Full transparency.',
                },
                {
                  question: 'What exchanges are supported?',
                  answer: 'We support 15+ major exchanges including Binance, Kraken, Coinbase Pro, and more. You can connect multiple exchanges simultaneously and trade across all of them from one dashboard.',
                },
                {
                  question: 'How fast are trades executed?',
                  answer: 'Our Executor agent places trades in an average of 0.2 seconds from decision to execution. The entire pipeline (Market Monitor → Decision Maker → Executor) typically completes in under 0.5 seconds.',
                },
              ].map((faq, index) => (
                <Card
                  key={index}
                  className="card-glass cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                      <HelpCircle
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          activeFAQ === index ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>
                  {activeFAQ === index && (
                    <CardContent>
                      <T.P className="text-muted-foreground">{faq.answer}</T.P>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-32 bg-gradient-primary text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-[800px]">
              <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl text-balance">
                Ready to automate your trading?
              </T.H2>
              <T.P className="mx-auto max-w-[700px] text-lg text-white/90 md:text-xl">
                Join thousands of traders using Photon to automate their strategies with AI-powered agents.
              </T.P>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" asChild>
                <Link href="/login">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white hover:text-primary"
                asChild
              >
                <Link href="/login">Try Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
