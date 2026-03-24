import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { createStudy, StudyCreate } from '../../services/studyService';

export default function NewStudy() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [platform, setPlatform] = useState('none');
    const [completionRedirectUrl, setCompletionRedirectUrl] = useState('');
    const [formData, setFormData] = useState<StudyCreate>({
        name: '',
        description: '',
        design_type: 'within-subject',
        target_participants: 50,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Please enter a study name');
            return;
        }

        try {
            setLoading(true);
            const config: Record<string, string> = {};
            if (platform !== 'none') config.platform = platform;
            if (completionRedirectUrl.trim()) config.completion_redirect_url = completionRedirectUrl.trim();
            const payload = {
                ...formData,
                configuration_json: Object.keys(config).length > 0 ? JSON.stringify(config) : undefined,
            };
            const study = await createStudy(payload);
            router.push(`/dashboard/procedure-builder?study_id=${study.id}`);
        } catch (err) {
            alert('Failed to create study. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation */}
            <nav className="bg-card border-b border-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>Back to Dashboard</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-3">Create New Study</h1>
                    <p className="text-muted-foreground text-lg">
                        Configure your study parameters. You can design the procedure after creating the study.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Study Name */}
                    <div className="bg-card rounded-2xl border border-border p-8">
                        <h2 className="text-xl font-bold mb-6">Basic Information</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-3">Study Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Conversational vs Traditional Search Study"
                                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-3">Description</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the purpose and goals of your study..."
                                    rows={4}
                                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Experimental Design */}
                    <div className="bg-card rounded-2xl border border-border p-8">
                        <h2 className="text-xl font-bold mb-6">Experimental Design</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label
                                className={`relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all ${formData.design_type === 'within-subject'
                                    ? 'border-blue-500 bg-blue-500/5'
                                    : 'border-border hover:border-blue-500/50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="design_type"
                                    value="within-subject"
                                    checked={formData.design_type === 'within-subject'}
                                    onChange={(e) => setFormData({ ...formData, design_type: e.target.value })}
                                    className="sr-only"
                                />
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </div>
                                <div className="font-semibold mb-1">Within-Subject</div>
                                <div className="text-sm text-muted-foreground">Each participant experiences all conditions with counterbalancing</div>
                            </label>

                            <label
                                className={`relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all ${formData.design_type === 'between-subject'
                                    ? 'border-purple-500 bg-purple-500/5'
                                    : 'border-border hover:border-purple-500/50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="design_type"
                                    value="between-subject"
                                    checked={formData.design_type === 'between-subject'}
                                    onChange={(e) => setFormData({ ...formData, design_type: e.target.value })}
                                    className="sr-only"
                                />
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="font-semibold mb-1">Between-Subject</div>
                                <div className="text-sm text-muted-foreground">Participants are assigned to one condition only</div>
                            </label>

                            <label
                                className={`relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all ${formData.design_type === 'time-series'
                                    ? 'border-green-500 bg-green-500/5'
                                    : 'border-border hover:border-green-500/50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="design_type"
                                    value="time-series"
                                    checked={formData.design_type === 'time-series'}
                                    onChange={(e) => setFormData({ ...formData, design_type: e.target.value })}
                                    className="sr-only"
                                />
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="font-semibold mb-1">Time-Series</div>
                                <div className="text-sm text-muted-foreground">Longitudinal study with pause/delay elements</div>
                            </label>
                        </div>
                    </div>

                    {/* Target Participants */}
                    <div className="bg-card rounded-2xl border border-border p-8">
                        <h2 className="text-xl font-bold mb-6">Recruitment Goals</h2>

                        <div>
                            <label className="block text-sm font-medium mb-3">Target Number of Participants</label>
                            <input
                                type="number"
                                value={formData.target_participants}
                                onChange={(e) => setFormData({ ...formData, target_participants: parseInt(e.target.value) || 0 })}
                                min={1}
                                className="w-32 bg-secondary border border-border rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                This helps track progress and can be adjusted later.
                            </p>
                        </div>
                    </div>

                    {/* Recruitment Platform Integration */}
                    <div className="bg-card rounded-2xl border border-border p-8">
                        <h2 className="text-xl font-bold mb-2">Recruitment Platform</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Configure integration with crowdsourcing platforms for participant recruitment.
                        </p>

                        <div className="space-y-6">
                            {/* Platform Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-3">Platform</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <label className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-blue-500/50 cursor-pointer transition-all">
                                        <input
                                            type="radio"
                                            name="platform"
                                            value="none"
                                            checked={platform === 'none'}
                                            onChange={() => setPlatform('none')}
                                            className="w-4 h-4 text-blue-500"
                                        />
                                        <div>
                                            <div className="font-medium">None / Direct Link</div>
                                            <div className="text-xs text-muted-foreground">Share study URL directly</div>
                                        </div>
                                    </label>
                                    <label className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-green-500/50 cursor-pointer transition-all">
                                        <input
                                            type="radio"
                                            name="platform"
                                            value="prolific"
                                            checked={platform === 'prolific'}
                                            onChange={() => setPlatform('prolific')}
                                            className="w-4 h-4 text-green-500"
                                        />
                                        <div>
                                            <div className="font-medium flex items-center space-x-2">
                                                <span>Prolific</span>
                                                <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">Popular</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">Academic research platform</div>
                                        </div>
                                    </label>
                                    <label className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-orange-500/50 cursor-pointer transition-all">
                                        <input
                                            type="radio"
                                            name="platform"
                                            value="mturk"
                                            checked={platform === 'mturk'}
                                            onChange={() => setPlatform('mturk')}
                                            className="w-4 h-4 text-orange-500"
                                        />
                                        <div>
                                            <div className="font-medium">Amazon MTurk</div>
                                            <div className="text-xs text-muted-foreground">Mechanical Turk</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Completion URL (shown for Prolific/MTurk) */}
                            <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm mb-1">How it works</h4>
                                        <ul className="text-xs text-muted-foreground space-y-1">
                                            <li>• Participants join via your platform with their ID in the URL</li>
                                            <li>• Example: <code className="bg-secondary px-1 rounded">yourstudy.com/?study_id=1&external_id=PROLIFIC_PID</code></li>
                                            <li>• Upon completion, they receive a unique code to submit</li>
                                            <li>• You can export all participant IDs and codes for payment</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Redirect Settings */}
                            <div>
                                <label className="block text-sm font-medium mb-3">Completion Redirect URL (Optional)</label>
                                <input
                                    type="url"
                                    value={completionRedirectUrl}
                                    onChange={(e) => setCompletionRedirectUrl(e.target.value)}
                                    placeholder="https://app.prolific.co/submissions/complete?cc={{COMPLETION_CODE}}"
                                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Participants will be redirected here after completing the study. Use <code className="bg-secondary px-1 rounded">{'{{COMPLETION_CODE}}'}</code> as placeholder.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard')}
                            className="px-8 py-3 rounded-xl text-sm font-medium bg-secondary hover:bg-accent text-foreground transition-all border border-border"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Study & Build Procedure'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
