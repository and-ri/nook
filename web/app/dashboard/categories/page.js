'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { Plus, Pencil, Trash2, Check, X, Tag } from 'lucide-react';

export default function CategoriesPage() {
    const t = useTranslations('Category');
    const tCommon = useTranslations('Common');

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Add
    const [addName, setAddName] = useState('');
    const [addSaving, setAddSaving] = useState(false);
    const [addError, setAddError] = useState(null);
    const addInputRef = useRef(null);

    // Edit
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState(null);

    const reload = () => {
        setLoading(true);
        getCategories()
            .then(res => setCategories(res.categories || []))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { reload(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!addName.trim()) return;
        setAddError(null);
        setAddSaving(true);
        try {
            await createCategory({ name: addName.trim() });
            setAddName('');
            reload();
        } catch (err) {
            setAddError(err.message);
        } finally {
            setAddSaving(false);
        }
    };

    const startEdit = (cat) => {
        setEditId(cat.id);
        setEditName(cat.name);
        setEditError(null);
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditName('');
        setEditError(null);
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!editName.trim()) return;
        setEditError(null);
        setEditSaving(true);
        try {
            await updateCategory(editId, { name: editName.trim() });
            cancelEdit();
            reload();
        } catch (err) {
            setEditError(err.message);
        } finally {
            setEditSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id);
            reload();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Add form */}
            <form onSubmit={handleAdd} className="flex gap-2">
                <Input
                    ref={addInputRef}
                    value={addName}
                    onChange={e => setAddName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    disabled={addSaving}
                    className="flex-1"
                />
                <Button type="submit" disabled={addSaving || !addName.trim()} size="default">
                    <Plus className="h-4 w-4 mr-2" />
                    {addSaving ? t('saving') : t('add')}
                </Button>
            </form>
            {addError && (
                <Alert variant="destructive" className="-mt-4">
                    <AlertDescription>{addError}</AlertDescription>
                </Alert>
            )}

            {/* List */}
            {loading ? (
                <Card>
                    <CardContent className="py-4 flex flex-col gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-4 flex-1" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ) : categories.length === 0 ? (
                <Card>
                    <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
                        <Tag className="h-10 w-10 text-muted-foreground/40" />
                        <p className="font-medium">{t('noCategories')}</p>
                        <p className="text-sm text-muted-foreground">{t('noCategoriesDesc')}</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        {categories.map((cat, idx) => (
                            <div key={cat.id}>
                                {idx > 0 && <Separator />}
                                {editId === cat.id ? (
                                    <form onSubmit={handleEdit} className="flex items-center gap-2 px-4 py-2.5">
                                        <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <Input
                                            autoFocus
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            disabled={editSaving}
                                            className="flex-1 h-8 text-sm"
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            variant="ghost"
                                            disabled={editSaving || !editName.trim()}
                                            className="h-8 w-8 text-green-600 hover:text-green-700 shrink-0"
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={cancelEdit}
                                            disabled={editSaving}
                                            className="h-8 w-8 shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        {editError && (
                                            <span className="text-xs text-destructive">{editError}</span>
                                        )}
                                    </form>
                                ) : (
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="flex-1 text-sm font-medium">{cat.name}</span>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-8 w-8"
                                                onClick={() => startEdit(cat)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {t('deleteDesc', { name: cat.name })}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            variant="destructive"
                                                            onClick={() => handleDelete(cat.id)}
                                                        >
                                                            {tCommon('delete')}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
