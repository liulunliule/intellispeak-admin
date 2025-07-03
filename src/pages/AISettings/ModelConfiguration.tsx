import { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { ReactComponent as SaveIcon } from '../../icons/save.svg?react';
import { ReactComponent as ResetIcon } from '../../icons/reset.svg?react';
import Button from '../../components/ui/button/Button';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Badge from '../../components/ui/badge/Badge';

export default function ModelConfiguration() {
    const [config, setConfig] = useState({
        modelName: 'GPT-4',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isActive: true
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        console.log('Configuration saved:', config);
        // Add API call here
    };

    const handleReset = () => {
        setConfig({
            modelName: 'GPT-4',
            temperature: 0.7,
            maxTokens: 2048,
            topP: 0.9,
            frequencyPenalty: 0,
            presencePenalty: 0,
            isActive: true
        });
    };

    return (
        <>
            <PageMeta title="Model Configuration" description="AI Model Configuration" />
            <PageBreadcrumb pageTitle="Model Configuration" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Model Parameters
                        </h3>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                className="flex items-center gap-2"
                            >
                                <ResetIcon className="w-4 h-4" />
                                Reset Defaults
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="flex items-center gap-2"
                            >
                                <SaveIcon className="w-4 h-4" />
                                Save Configuration
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label>Model Name</Label>
                            <Input
                                name="modelName"
                                value={config.modelName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Label>Temperature: {config.temperature}</Label>
                                <input
                                    type="range"
                                    name="temperature"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={config.temperature}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>Precise</span>
                                    <span>Balanced</span>
                                    <span>Creative</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>Max Tokens</Label>
                            <Input
                                type="number"
                                name="maxTokens"
                                value={config.maxTokens}
                                onChange={handleChange}
                                min="256"
                                max="4096"
                            />
                        </div>

                        <div>
                            <Label>Top P</Label>
                            <Input
                                type="number"
                                name="topP"
                                value={config.topP}
                                onChange={handleChange}
                                min="0"
                                max="1"
                            />
                        </div>

                        <div>
                            <Label>Frequency Penalty</Label>
                            <Input
                                type="number"
                                name="frequencyPenalty"
                                value={config.frequencyPenalty}
                                onChange={handleChange}
                                min="0"
                                max="2"
                            />
                        </div>

                        <div>
                            <Label>Presence Penalty</Label>
                            <Input
                                type="number"
                                name="presencePenalty"
                                value={config.presencePenalty}
                                onChange={handleChange}
                                min="0"
                                max="2"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={config.isActive}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <Label htmlFor="isActive" className="!mb-0">
                                Active Model
                            </Label>
                            <Badge color={config.isActive ? 'success' : 'error'}>
                                {config.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}