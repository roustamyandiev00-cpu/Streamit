'use client';

import React, { useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState('annually');

    const plans = {
        creators: [
            {
                name: 'Standard',
                monthlyPrice: 9,
                annualPrice: 7,
                features: {
                    multistreaming: [
                        '3 kanalen tegelijk',
                        'Paired channels + Custom RTMP',
                        'Cloud opnames + Transcriptie',
                        'Geen Streamit watermark'
                    ],
                    studio: [
                        'Persoonlijke logo\'s en graphics',
                        '10 deelnemers op scherm'
                    ],
                    upload: [
                        'Pre-recorded streaming — 30min'
                    ]
                }
            },
            {
                name: 'Professional',
                monthlyPrice: 24,
                annualPrice: 19,
                popular: true,
                features: {
                    multistreaming: [
                        '5 kanalen tegelijk',
                        'Starts at 2 team seats',
                        'Local video/audio opnames',
                        'Video Looping'
                    ],
                    studio: [
                        'Full HD, 1080p kwaliteit',
                        'Co-producers'
                    ],
                    upload: [
                        'Pre-recorded streaming — 1hr'
                    ]
                }
            }
        ]
    };

    const handleSelectPlan = (planName) => {
        alert(`Plan "${planName}" geselecteerd! Checkout functionaliteit komt binnenkort.`);
    };

    return (
        <div className="pricing-page">
            <div className="pricing-container">
                {/* Header */}
                <div className="pricing-header">
                    <Link href="/" className="back-link">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1>Upgrade om te groeien en je publiek te bereiken.</h1>
                </div>

                {/* Billing Toggle */}
                <div className="billing-toggle">
                    <button
                        className={`toggle-btn ${billingCycle === 'annually' ? 'active' : ''}`}
                        onClick={() => setBillingCycle('annually')}
                    >
                        Jaarlijks — 2 maanden gratis
                    </button>
                    <button
                        className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                        onClick={() => setBillingCycle('monthly')}
                    >
                        Maandelijks
                    </button>
                </div>

                {/* For Creators Section */}
                <div className="plans-section">
                    <div className="section-header">
                        <h2 className="section-title">Voor Creators</h2>
                        <p className="section-description">
                            Sluit je aan bij miljoenen gamers, artiesten en podcasters.
                        </p>
                    </div>

                    <div className="plans-grid">
                        {plans.creators.map((plan) => (
                            <PlanCard
                                key={plan.name}
                                plan={plan}
                                billingCycle={billingCycle}
                                onSelect={() => handleSelectPlan(plan.name)}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="pricing-footer">
                    <span>Alle prijzen zijn in USD. 7-dagen geld-terug garantie</span>
                </div>
            </div>

            <style jsx>{`
                .pricing-page {
                    min-height: 100vh;
                    background: var(--bg-main);
                    color: var(--text-main);
                    padding: 2rem 0;
                }

                .pricing-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                .pricing-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 3rem;
                }

                .back-link {
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .back-link:hover {
                    color: var(--text-main);
                }

                .pricing-header h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0;
                    color: var(--text-main);
                }

                .billing-toggle {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 3rem;
                    justify-content: center;
                }

                .toggle-btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--border-custom);
                    background: var(--bg-card);
                    color: var(--text-muted);
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 0.9rem;
                    transition: all 0.2s ease;
                }

                .toggle-btn.active {
                    background: var(--primary-hex);
                    color: white;
                    border-color: var(--primary-hex);
                }

                .toggle-btn:hover:not(.active) {
                    background: var(--bg-card-hover);
                    color: var(--text-main);
                    border-color: var(--border-hover);
                }

                .plans-section {
                    margin-bottom: 4rem;
                }

                .section-header {
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .section-title {
                    color: var(--primary-hex);
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0 0 0.5rem 0;
                }

                .section-description {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin: 0;
                }

                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 2rem;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .pricing-footer {
                    margin-top: 4rem;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                @media (max-width: 768px) {
                    .plans-grid {
                        grid-template-columns: 1fr;
                    }

                    .pricing-header h1 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}

function PlanCard({ plan, billingCycle, onSelect }) {
    const price = billingCycle === 'annually' ? plan.annualPrice : plan.monthlyPrice;
    const originalPrice = billingCycle === 'annually' ? plan.monthlyPrice : null;
    const yearlyTotal = billingCycle === 'annually' ? (plan.annualPrice * 12) : null;

    return (
        <div className={`plan-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && (
                <div className="popular-badge">Populair</div>
            )}

            <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-pricing">
                    <div className="price-row">
                        <span className="price">${price}</span>
                        <span className="price-period">/maand</span>
                        {originalPrice && originalPrice !== price && (
                            <span className="original-price">${originalPrice}</span>
                        )}
                    </div>
                    {yearlyTotal && (
                        <div className="yearly-price">${yearlyTotal} per jaar</div>
                    )}
                </div>
            </div>

            <button
                className={`select-btn ${plan.popular ? 'primary' : 'outline'}`}
                onClick={onSelect}
            >
                Selecteer Plan
            </button>

            <div className="plan-features">
                {plan.features.multistreaming && plan.features.multistreaming.length > 0 && (
                    <div className="feature-group">
                        <h4 className="feature-group-title">MULTISTREAMING:</h4>
                        <ul className="feature-list">
                            {plan.features.multistreaming.map((feature, idx) => (
                                <li key={idx} className="feature-item">
                                    <Check size={16} className="check-icon" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {plan.features.studio && plan.features.studio.length > 0 && (
                    <div className="feature-group">
                        <h4 className="feature-group-title">STREAMIT STUDIO:</h4>
                        <ul className="feature-list">
                            {plan.features.studio.map((feature, idx) => (
                                <li key={idx} className="feature-item">
                                    <Check size={16} className="check-icon" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {plan.features.upload && plan.features.upload.length > 0 && (
                    <div className="feature-group">
                        <h4 className="feature-group-title">UPLOAD & STREAM:</h4>
                        <ul className="feature-list">
                            {plan.features.upload.map((feature, idx) => (
                                <li key={idx} className="feature-item">
                                    <Check size={16} className="check-icon" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <style jsx>{`
                .plan-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-custom);
                    border-radius: var(--radius);
                    padding: 2rem;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.2s ease;
                    box-shadow: var(--shadow-sm);
                }

                .plan-card:hover {
                    border-color: var(--border-hover);
                    box-shadow: var(--shadow-md);
                    transform: translateY(-1px);
                }

                .plan-card.popular {
                    border: 2px solid var(--primary-hex);
                    background: var(--bg-card);
                    box-shadow: var(--shadow-md);
                }

                .popular-badge {
                    position: absolute;
                    top: -12px;
                    right: 1.5rem;
                    background: var(--primary-hex);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .plan-header {
                    margin-bottom: 2rem;
                }

                .plan-name {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin: 0 0 1rem 0;
                    color: var(--text-main);
                }

                .plan-pricing {
                    margin-bottom: 1rem;
                }

                .price-row {
                    display: flex;
                    align-items: baseline;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }

                .price {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .price-period {
                    color: var(--text-muted);
                    font-size: 1rem;
                }

                .original-price {
                    color: var(--text-subtle);
                    text-decoration: line-through;
                    font-size: 1.25rem;
                    font-weight: 500;
                }

                .yearly-price {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .select-btn {
                    width: 100%;
                    padding: 0.875rem;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 2rem;
                }

                .select-btn.primary {
                    background: var(--primary-hex);
                    color: white;
                }

                .select-btn.primary:hover {
                    background: var(--primary-hover);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-md);
                }

                .select-btn.outline {
                    background: transparent;
                    color: var(--primary-hex);
                    border: 1px solid var(--primary-hex);
                }

                .select-btn.outline:hover {
                    background: var(--primary-hex);
                    color: white;
                }

                .plan-features {
                    flex: 1;
                }

                .feature-group {
                    margin-bottom: 1.5rem;
                }

                .feature-group:last-child {
                    margin-bottom: 0;
                }

                .feature-group-title {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin: 0 0 0.75rem 0;
                }

                .feature-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .feature-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    color: var(--text-main);
                }

                .feature-item:last-child {
                    margin-bottom: 0;
                }

                .check-icon {
                    color: #10b981;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
            `}</style>
        </div>
    );
}
