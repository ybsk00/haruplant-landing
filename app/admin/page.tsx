"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";

type Lead = {
    id: number;
    name: string;
    phone: string;
    preferred_time: string;
    created_at: string;
    source: string;
    vision_result: string;
    status: string;
}

export default function AdminPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/leads');
            const data = await res.json();
            if (Array.isArray(data)) {
                setLeads(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleDownloadExcel = () => {
        // Since we don't have a real excel lib in this environment without adding more heavy deps like xlsx in frontend,
        // we can trigger a CSV download or simple endpoint.
        // For now, let's just do a CSV export in browser or link to api/export
        window.location.href = "/api/export";
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Haru Implant Admin</h1>
                    <div className="flex gap-4">
                        <button onClick={fetchLeads} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border hover:bg-gray-50">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            새로고침
                        </button>
                        <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <Download className="w-4 h-4" />
                            엑셀 다운로드
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600">ID</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">접수일시</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">고객명</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">연락처</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">선호시간</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">유입경로</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">상담상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 text-sm text-gray-500">{lead.id}</td>
                                    <td className="p-4 text-sm text-gray-800">{new Date(lead.created_at).toLocaleString('ko-KR')}</td>
                                    <td className="p-4 text-sm font-medium text-gray-900">{lead.name}</td>
                                    <td className="p-4 text-sm text-gray-600">{lead.phone}</td>
                                    <td className="p-4 text-sm text-gray-600">{lead.preferred_time || '-'}</td>
                                    <td className="p-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${lead.source === 'chatbot' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
                                            {lead.source}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                                            {lead.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {leads.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gray-400">
                                        아직 접수된 데이터가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
