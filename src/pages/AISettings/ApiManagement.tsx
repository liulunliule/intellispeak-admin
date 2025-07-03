import { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { ReactComponent as KeyIcon } from '../../icons/key.svg?react';
import { ReactComponent as CopyIcon } from '../../icons/copy.svg?react';
// import { ReactComponent as RefreshIcon } from '../../icons/refresh.svg?react';
import Button from '../../components/ui/button/Button';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Badge from '../../components/ui/badge/Badge';

export default function ApiManagement() {
    const [apiKeys, setApiKeys] = useState([
        {
            id: 'key_1',
            name: 'Production Key',
            key: 'sk_prod_1234567890abcdef1234567890abcdef',
            lastUsed: '2023-06-15 14:30',
            usage: 1425,
            isActive: true
        },
        {
            id: 'key_2',
            name: 'Development Key',
            key: 'sk_dev_abcdef1234567890abcdef1234567890',
            lastUsed: '2023-06-10 09:15',
            usage: 320,
            isActive: true
        },
        {
            id: 'key_3',
            name: 'Backup Key',
            key: 'sk_bak_7890abcdef1234567890abcdef123456',
            lastUsed: 'Never',
            usage: 0,
            isActive: false
        }
    ]);

    const [newKeyName, setNewKeyName] = useState('');
    const [showNewKey, setShowNewKey] = useState(false);

    const generateNewKey = () => {
        if (!newKeyName.trim()) return;

        const newKey = {
            id: `key_${Date.now()}`,
            name: newKeyName,
            key: `sk_new_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`,
            lastUsed: 'Never',
            usage: 0,
            isActive: true
        };

        setApiKeys([...apiKeys, newKey]);
        setNewKeyName('');
        setShowNewKey(true);
    };

    const toggleKeyStatus = (id: string) => {
        setApiKeys(apiKeys.map(key =>
            key.id === id ? { ...key, isActive: !key.isActive } : key
        ));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <>
            <PageMeta title="API Management" description="AI API Key Management" />
            <PageBreadcrumb pageTitle="API Management" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            API Keys
                        </h3>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setNewKeyName('');
                                    setShowNewKey(false);
                                }}
                            >
                                Add New Key
                            </Button>
                        </div>
                    </div>

                    {/* Add New Key Form */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <Label>Key Name</Label>
                                <Input
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="e.g., Mobile App Key"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={generateNewKey}
                                    disabled={!newKeyName.trim()}
                                    className="flex items-center gap-2"
                                >
                                    <KeyIcon className="w-4 h-4" />
                                    Generate Key
                                </Button>
                            </div>
                        </div>

                        {showNewKey && (
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-yellow-800 dark:text-yellow-200">
                                        New API Key Generated
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copyToClipboard(apiKeys[apiKeys.length - 1].key)}
                                        className="flex items-center gap-1"
                                    >
                                        <CopyIcon className="w-3 h-3" />
                                        Copy
                                    </Button>
                                </div>
                                <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded font-mono text-sm break-all">
                                    {apiKeys[apiKeys.length - 1].key}
                                </div>
                                <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                    Please save this key securely. You won't be able to see it again.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* API Keys List */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Key Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Last Used
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Usage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                {apiKeys.map((key) => (
                                    <tr key={key.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <KeyIcon className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                        {key.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {key.key.substring(0, 8)}...{key.key.substring(key.key.length - 4)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {key.lastUsed}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {key.usage.toLocaleString()} requests
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge color={key.isActive ? 'success' : 'error'}>
                                                {key.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => toggleKeyStatus(key.id)}
                                                >
                                                    {key.isActive ? 'Deactivate' : 'Activate'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    Revoke
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}