import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ChevronRight, ChevronDown, Table, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SizeChartData {
    headers: string[];
    rows: string[][];
}

interface SizeChartBuilderProps {
    initialData: SizeChartData | null;
    onChange: (data: SizeChartData | null) => void;
}

export function SizeChartBuilder({ initialData, onChange }: SizeChartBuilderProps) {
    const [headers, setHeaders] = useState<string[]>(initialData?.headers || ['Size']);
    const [rows, setRows] = useState<string[][]>(initialData?.rows || [['']]);
    const [isOpen, setIsOpen] = useState(false);
    const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);

    useEffect(() => {
        if (initialData) {
            setHeaders(initialData.headers);
            setRows(initialData.rows);
        }
    }, [initialData]);

    const updateData = (newHeaders: string[], newRows: string[][]) => {
        if (newHeaders.length === 0 && newRows.length === 0) {
            onChange(null);
        } else {
            onChange({ headers: newHeaders, rows: newRows });
        }
    };

    const addColumn = () => {
        const newHeaders = [...headers, 'New Column'];
        const newRows = rows.map(row => [...row, '']);
        setHeaders(newHeaders);
        setRows(newRows);
        updateData(newHeaders, newRows);
    };

    const removeColumn = (index: number) => {
        if (headers.length <= 1) return;
        const newHeaders = headers.filter((_, i) => i !== index);
        const newRows = rows.map(row => row.filter((_, i) => i !== index));
        setHeaders(newHeaders);
        setRows(newRows);
        updateData(newHeaders, newRows);
    };

    const addRow = () => {
        const newRow = new Array(headers.length).fill('');
        const newRows = [...rows, newRow];
        setRows(newRows);
        updateData(headers, newRows);
    };

    const removeRow = (index: number) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
        updateData(headers, newRows);
    };

    const updateHeader = (index: number, value: string) => {
        const newHeaders = [...headers];
        newHeaders[index] = value;
        setHeaders(newHeaders);
        updateData(newHeaders, rows);
    };

    const updateCell = (rowIndex: number, colIndex: number, value: string) => {
        const newRows = [...rows];
        newRows[rowIndex] = [...newRows[rowIndex]];
        newRows[rowIndex][colIndex] = value;
        setRows(newRows);
        updateData(headers, newRows);
    };

    const handleDragStart = (index: number) => {
        setDraggedRowIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedRowIndex === null || draggedRowIndex === index) return;

        const newRows = [...rows];
        const draggedRow = newRows[draggedRowIndex];
        newRows.splice(draggedRowIndex, 1);
        newRows.splice(index, 0, draggedRow);

        setRows(newRows);
        setDraggedRowIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedRowIndex(null);
        updateData(headers, rows);
    };

    return (
        <div className="space-y-4 border border-accent/10 rounded-2xl p-4 bg-white/50">
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                        Size Chart Configuration
                    </span>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>

            {isOpen && (
                <div className="space-y-6 animate-fade-in mt-4">
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full min-w-[500px] border-collapse">
                            <thead>
                                <tr>
                                    <th className="w-10"></th>
                                    {headers.map((header, index) => (
                                        <th key={index} className="p-2 relative group min-w-[120px]">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={header}
                                                    onChange={(e) => updateHeader(index, e.target.value)}
                                                    className="h-10 text-[10px] uppercase font-black tracking-widest bg-accent/5 border-accent/10 focus-visible:ring-0 focus-visible:border-accent text-accent text-center rounded-lg"
                                                />
                                                {headers.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeColumn(index)}
                                                        className="p-1 hover:text-rose-500 opacity-20 group-hover:opacity-100 transition-all"
                                                    >
                                                        <XIcon />
                                                    </button>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="p-2 w-10">
                                        <button
                                            type="button"
                                            onClick={addColumn}
                                            className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent hover:text-white transition-all mx-auto"
                                            title="Add Column"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        draggable
                                        onDragStart={() => handleDragStart(rowIndex)}
                                        onDragOver={(e) => handleDragOver(e, rowIndex)}
                                        onDragEnd={handleDragEnd}
                                        className={cn(
                                            "group/row transition-colors",
                                            draggedRowIndex === rowIndex ? "opacity-30 bg-accent/5" : "hover:bg-accent/5"
                                        )}
                                    >
                                        <td className="p-2 cursor-grab active:cursor-grabbing text-primary/20 hover:text-accent transition-colors">
                                            <GripVertical className="w-4 h-4" />
                                        </td>
                                        {row.map((cell, colIndex) => (
                                            <td key={colIndex} className="p-2">
                                                <Input
                                                    value={cell}
                                                    onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                                                    className="h-12 text-sm text-center border-black/5 bg-white rounded-xl focus-visible:ring-0 focus-visible:border-accent"
                                                    placeholder="-"
                                                />
                                            </td>
                                        ))}
                                        <td className="p-2 text-center text-primary/20">
                                            <button
                                                type="button"
                                                onClick={() => removeRow(rowIndex)}
                                                className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full opacity-0 group-hover/row:opacity-100 transition-all focus:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Button
                        type="button"
                        onClick={addRow}
                        variant="outline"
                        className="w-full border-dashed border-accent/20 hover:border-accent hover:text-accent hover:bg-accent/5 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Sizing Row
                    </Button>
                </div>
            )}
        </div>
    );
}

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
)
