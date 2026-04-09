'use client';

import * as React from 'react';
import { Button } from './button';
import { FloatingLabelInput } from './floating-label-input';
import { Pill } from './pill';
import { HeroPanel } from './hero-panel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Check, TrendingUp, Shield } from 'lucide-react';

export function PublicDesignSystemDemo() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Public.com Design System Components</h2>
        
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Floating Label Input</CardTitle>
            <CardDescription>Input fields with animated floating labels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FloatingLabelInput
              label="Email"
              type="email"
              placeholder=""
            />
            <FloatingLabelInput
              label="Password"
              type="password"
              showPasswordToggle
              placeholder=""
            />
            <FloatingLabelInput
              label="Phone Number"
              type="tel"
              placeholder=""
            />
            <FloatingLabelInput
              label="Error State"
              type="text"
              error
              placeholder=""
            />
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>All button styles from public.com</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="hairline">Hairline</Button>
              <Button variant="hairlineSecondary">Hairline Secondary</Button>
              <Button variant="overlay">Overlay</Button>
              <Button variant="terminal">Terminal</Button>
              <Button variant="terminalSecondary">Terminal Secondary</Button>
              <Button variant="gradient">Gradient</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Pills / Badges</CardTitle>
            <CardDescription>Category pills with icons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Pill variant="default" showCheck>Stocks</Pill>
              <Pill variant="default" showCheck>Options Trading</Pill>
              <Pill variant="default" showCheck>Treasuries</Pill>
              <Pill variant="default" showCheck>Bonds</Pill>
              <Pill variant="outline">New Feature</Pill>
              <Pill variant="gradient">Premium</Pill>
              <Pill variant="success">Success</Pill>
              <Pill variant="warning">Warning</Pill>
              <Pill variant="error">Error</Pill>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Hero Panel</CardTitle>
            <CardDescription>Hero section component from public.com</CardDescription>
          </CardHeader>
          <CardContent>
            <HeroPanel
              title={
                <>
                  Investing for those <span className="font-normal">who take it seriously</span>
                </>
              }
              features={[
                {
                  icon: <TrendingUp className="w-3 h-3" />,
                  label: 'Multi-asset investing',
                },
                {
                  icon: <TrendingUp className="w-3 h-3" />,
                  label: 'Industry-leading yields',
                },
                {
                  icon: <Shield className="w-3 h-3" />,
                  label: 'Trusted by millions',
                },
              ]}
              pills={[
                { label: 'Stocks' },
                { label: 'Options Trading' },
                { label: 'Treasuries' },
                { label: 'Bonds' },
                { label: 'High-Yield Cash Account', badge: 'APY' },
                { label: 'ETFs' },
                { label: 'Crypto' },
              ]}
              disclosures={
                <p className="text-xs text-[#516880]">
                  All investing involves risk, including loss of principle. See{' '}
                  <a href="#" className="text-[#0038ff] underline">
                    disclosures
                  </a>{' '}
                  for more information.
                </p>
              }
            />
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Glass Morphism Effects</CardTitle>
            <CardDescription>Backdrop blur and transparency effects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 rounded-lg card-glass">
              <p className="font-semibold mb-2">Card Glass</p>
              <p className="text-sm text-muted-foreground">
                Standard glass morphism effect with backdrop blur
              </p>
            </div>
            <div className="p-6 rounded-lg glass-light">
              <p className="font-semibold mb-2">Glass Light</p>
              <p className="text-sm text-muted-foreground">
                Lighter glass effect with less opacity
              </p>
            </div>
            <div className="p-6 rounded-lg glass-strong">
              <p className="font-semibold mb-2">Glass Strong</p>
              <p className="text-sm text-muted-foreground">
                Stronger glass effect with more blur and shadow
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Gradients</CardTitle>
            <CardDescription>Gradient backgrounds and text</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-6 rounded-lg bg-gradient-blue text-white">
                <p className="font-semibold">Blue</p>
              </div>
              <div className="p-6 rounded-lg bg-gradient-yellow text-white">
                <p className="font-semibold">Yellow</p>
              </div>
              <div className="p-6 rounded-lg bg-gradient-red text-white">
                <p className="font-semibold">Red</p>
              </div>
              <div className="p-6 rounded-lg bg-gradient-green text-white">
                <p className="font-semibold">Green</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gradient-blue">Blue Gradient Text</p>
              <p className="text-2xl font-bold text-gradient-yellow">Yellow Gradient Text</p>
              <p className="text-2xl font-bold text-gradient-red">Red Gradient Text</p>
              <p className="text-2xl font-bold text-gradient-green">Green Gradient Text</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}





