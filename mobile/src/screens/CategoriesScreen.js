import React, { useCallback, useState } from 'react';
import { Alert as RNAlert, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslations } from 'use-intl';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { Alert, AlertText } from '@/components/ui/alert';
import { AddIcon } from '@/components/ui/icon';

export default function CategoriesScreen({ navigation }) {
  const t = useTranslations('Category');
  const tCommon = useTranslations('Common');

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [addName, setAddName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const reload = useCallback(() => {
    getCategories()
      .then((res) => setCategories(res.categories || []))
      .catch((e) => setError(e.message));
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const handleAdd = async () => {
    if (!addName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createCategory({ name: addName.trim() });
      setAddName('');
      reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    try {
      await updateCategory(editId, { name: editName.trim() });
      setEditId(null);
      setEditName('');
      reload();
    } catch (e) {
      setError(e.message);
    }
  };

  const confirmDelete = (cat) => {
    RNAlert.alert(t('deleteTitle'), t('deleteDesc', { name: cat.name }), [
      { text: tCommon('cancel'), style: 'cancel' },
      {
        text: tCommon('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(cat.id);
            reload();
          } catch (e) {
            setError(e.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const editing = editId === item.id;
    return (
      <HStack space="sm" className="items-center py-2 border-b border-outline-100">
        {editing ? (
          <>
            <Input className="flex-1">
              <InputField value={editName} onChangeText={setEditName} autoFocus />
            </Input>
            <Pressable onPress={handleSaveEdit} className="p-2">
              <Ionicons name="checkmark" size={20} color="#22c55e" />
            </Pressable>
            <Pressable onPress={() => setEditId(null)} className="p-2">
              <Ionicons name="close" size={20} color="#737373" />
            </Pressable>
          </>
        ) : (
          <>
            <Ionicons name="pricetag-outline" size={18} color="#737373" />
            <Text className="flex-1 text-typography-900">{item.name}</Text>
            <Pressable onPress={() => { setEditId(item.id); setEditName(item.name); }} className="p-2">
              <Ionicons name="create-outline" size={20} color="#737373" />
            </Pressable>
            <Pressable onPress={() => confirmDelete(item)} className="p-2">
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </Pressable>
          </>
        )}
      </HStack>
    );
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader title={t('title')} onBack={() => navigation.goBack()} />
      <VStack space="md" className="p-5 flex-1">
        <Text className="text-sm text-typography-500">{t('description')}</Text>

        {!!error && (
          <Alert action="error" variant="outline">
            <AlertText>{error}</AlertText>
          </Alert>
        )}

        <HStack space="sm">
          <Input className="flex-1">
            <InputField
              value={addName}
              onChangeText={setAddName}
              placeholder={t('namePlaceholder')}
              onSubmitEditing={handleAdd}
            />
          </Input>
          <Button onPress={handleAdd} isDisabled={saving || !addName.trim()}>
            <ButtonIcon as={AddIcon} className="mr-1" />
            <ButtonText>{saving ? t('saving') : t('add')}</ButtonText>
          </Button>
        </HStack>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Box className="items-center py-16">
              <Ionicons name="pricetags-outline" size={40} color="#a3a3a3" />
              <Text className="text-typography-400 mt-3">{t('noCategories')}</Text>
            </Box>
          }
        />
      </VStack>
    </Screen>
  );
}
