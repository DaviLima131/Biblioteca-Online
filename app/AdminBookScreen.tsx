import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  bookCategories,
  defaultLendingLocation,
  type Book,
  type NewBook,
} from './books';

type Props = {
  initialBook?: Book;
  savedLendingLocations: string[];
  onAddSavedLocation: (location: string) => void;
  onUpdateSavedLocation: (location: string, replacement: string) => void;
  onDeleteSavedLocation: (location: string) => void;
  onBack: () => void;
  onPublish: (book: NewBook) => void;
};

export default function AdminBookScreen({
  initialBook,
  savedLendingLocations,
  onAddSavedLocation,
  onUpdateSavedLocation,
  onDeleteSavedLocation,
  onBack,
  onPublish,
}: Props) {
  const isEditing = Boolean(initialBook);
  const [title, setTitle] = useState(initialBook?.title ?? '');
  const [author, setAuthor] = useState(initialBook?.author ?? '');
  const [category, setCategory] = useState(initialBook?.category ?? '');
  const [isCustomCategory, setIsCustomCategory] = useState(
    initialBook
      ? !bookCategories.some(
          (bookCategory) => bookCategory === initialBook.category
        )
      : false
  );
  const [description, setDescription] = useState(initialBook?.description ?? '');
  const [price, setPrice] = useState(
    initialBook ? String(initialBook.price).replace('.', ',') : ''
  );
  const [imageUri, setImageUri] = useState<string | null>(
    initialBook?.imageUri ?? null
  );
  const [lendingLocationsText, setLendingLocationsText] = useState(
    initialBook?.lendingLocations?.join('\n') ??
      (savedLendingLocations.includes(defaultLendingLocation)
        ? defaultLendingLocation
        : '')
  );
  const [newLendingLocation, setNewLendingLocation] = useState('');
  const [editingSavedLocation, setEditingSavedLocation] = useState<
    string | null
  >(null);
  const [editedSavedLocationText, setEditedSavedLocationText] = useState('');
  const selectedLendingLocations = new Set(
    lendingLocationsText
      .split('\n')
      .map((location) => location.trim().toLowerCase())
      .filter(Boolean)
  );

  const toggleSavedLocation = (location: string) => {
    setLendingLocationsText((currentText) => {
      const currentLocations = currentText
        .split('\n')
        .map((currentLocation) => currentLocation.trim())
        .filter(Boolean);
      const isSelected = currentLocations.some(
        (currentLocation) =>
          currentLocation.toLowerCase() === location.toLowerCase()
      );

      return (
        isSelected
          ? currentLocations.filter(
              (currentLocation) =>
                currentLocation.toLowerCase() !== location.toLowerCase()
            )
          : [...currentLocations, location]
      ).join('\n');
    });
  };

  const handleAddLendingLocation = () => {
    const enteredLocation = newLendingLocation.trim();
    if (!enteredLocation) {
      Alert.alert('Local inválido', 'Digite um endereço para adicionar.');
      return;
    }

    const savedLocation = savedLendingLocations.find(
      (location) => location.toLowerCase() === enteredLocation.toLowerCase()
    );
    const locationToAdd = savedLocation ?? enteredLocation;
    const isAlreadySelected = lendingLocationsText
      .split('\n')
      .some(
        (location) => location.trim().toLowerCase() === locationToAdd.toLowerCase()
      );

    if (isAlreadySelected) {
      Alert.alert('Local já selecionado', 'Esse endereço já está selecionado.');
      return;
    }

    setLendingLocationsText((currentText) =>
      [...currentText.split('\n').filter(Boolean), locationToAdd].join('\n')
    );
    if (!savedLocation) {
      onAddSavedLocation(locationToAdd);
    }
    setNewLendingLocation('');
  };

  const saveEditedSavedLocation = () => {
    if (!editingSavedLocation) {
      return;
    }

    const replacement = editedSavedLocationText.trim();
    if (!replacement) {
      Alert.alert('Local inválido', 'Informe um endereço para salvar.');
      return;
    }

    const originalLocation = editingSavedLocation;
    setLendingLocationsText((currentText) =>
      currentText
        .split('\n')
        .map((location) =>
          location.trim().toLowerCase() === originalLocation.toLowerCase()
            ? replacement
            : location
        )
        .join('\n')
    );
    onUpdateSavedLocation(originalLocation, replacement);
    setEditingSavedLocation(null);
  };

  const confirmDeleteSavedLocation = (location: string) => {
    Alert.alert(
      'Excluir local cadastrado?',
      'O local será removido de todos os livros que o utilizam.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setLendingLocationsText((currentText) =>
              currentText
                .split('\n')
                .filter(
                  (currentLocation) =>
                    currentLocation.trim().toLowerCase() !==
                    location.toLowerCase()
                )
                .join('\n')
            );
            onDeleteSavedLocation(location);
          },
        },
      ]
    );
  };

  const handleChooseImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const image = result.assets[0];
      if (!image) {
        Alert.alert(
          'Imagem indisponível',
          'Não foi possível carregar a foto escolhida. Tente selecionar outra.'
        );
        return;
      }

      setImageUri(image.uri);
    } catch (error) {
      Alert.alert(
        'Erro ao selecionar foto',
        error instanceof Error
          ? error.message
          : 'Não foi possível abrir a galeria.'
      );
    }
  };

  const handlePublish = () => {
    const normalizedPrice = Number(price.trim().replace(',', '.'));

    if (
      !title.trim() ||
      !author.trim() ||
      !category.trim() ||
      !description.trim() ||
      !price.trim()
    ) {
      Alert.alert('Dados incompletos', 'Preencha todos os campos do livro.');
      return;
    }

    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      Alert.alert('Preço inválido', 'Informe um preço maior que zero.');
      return;
    }

    const lendingLocations = Array.from(
      new Map(
        lendingLocationsText
          .split('\n')
          .map((location) => location.trim())
          .filter(Boolean)
          .map((location) => [location.toLocaleLowerCase(), location])
      ).values()
    );

    onPublish({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      description: description.trim(),
      price: normalizedPrice,
      lendingLocations,
      imageUri: imageUri ?? undefined,
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            {isEditing ? '← Voltar aos detalhes' : '← Voltar ao catálogo'}
          </Text>
        </Pressable>

        <Text style={styles.eyebrow}>ÁREA DO ADMINISTRADOR</Text>
        <Text style={styles.title}>
          {isEditing ? 'Editar livro' : 'Publicar um livro'}
        </Text>
        <Text style={styles.subtitle}>
          {isEditing
            ? 'Altere as informações do livro e salve as atualizações.'
            : 'Preencha as informações para adicionar o livro ao catálogo.'}
        </Text>

        <View style={styles.form}>
          <Field
            label="Título"
            placeholder="Nome do livro"
            value={title}
            onChangeText={setTitle}
          />
          <Field
            label="Autor"
            placeholder="Nome do autor"
            value={author}
            onChangeText={setAuthor}
          />
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Gênero do livro</Text>
            <View style={styles.categories}>
              {bookCategories.map((bookCategory) => {
                const isSelected = category === bookCategory;

                return (
                  <Pressable
                    key={bookCategory}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      setCategory(bookCategory);
                      setIsCustomCategory(false);
                    }}
                    style={[
                      styles.categoryOption,
                      isSelected && styles.categoryOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        isSelected && styles.categoryOptionTextSelected,
                      ]}
                    >
                      {bookCategory}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isCustomCategory }}
                onPress={() => {
                  if (!isCustomCategory) {
                    setCategory('');
                  }
                  setIsCustomCategory(true);
                }}
                style={[
                  styles.categoryOption,
                  isCustomCategory && styles.categoryOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    isCustomCategory && styles.categoryOptionTextSelected,
                  ]}
                >
                  Outro
                </Text>
              </Pressable>
            </View>
            {isCustomCategory && (
              <TextInput
                accessibilityLabel="Gênero personalizado do livro"
                style={[styles.input, styles.customCategoryInput]}
                placeholder="Digite o gênero do livro"
                placeholderTextColor="#A6A39B"
                value={category}
                onChangeText={setCategory}
                autoCapitalize="words"
                returnKeyType="done"
              />
            )}
          </View>
          <Field
            label="Descrição"
            placeholder="Conte um pouco sobre a história"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Foto da capa</Text>
            <Pressable
              accessibilityRole="button"
              onPress={handleChooseImage}
              style={styles.imagePicker}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                  accessibilityLabel="Prévia da capa do livro"
                />
              ) : (
                <Text style={styles.imagePlaceholder}>＋ Escolher foto</Text>
              )}
              {imageUri && (
                <Text style={styles.changeImageText}>Trocar foto</Text>
              )}
            </Pressable>
          </View>
          <Field
            label="Preço (R$)"
            placeholder="Ex.: 39,90"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Locais para retirada de empréstimo</Text>
            {savedLendingLocations.length > 0 && (
              <View style={styles.savedLocations}>
                <Text style={styles.savedLocationsLabel}>Locais já cadastrados</Text>
                {savedLendingLocations.map((location) => {
                  const isSelected = selectedLendingLocations.has(
                    location.toLowerCase()
                  );

                  return (
                    <View key={location} style={styles.savedLocationRow}>
                      {editingSavedLocation === location ? (
                        <View style={styles.savedLocationEditor}>
                          <TextInput
                            accessibilityLabel="Editar local cadastrado"
                            style={styles.input}
                            value={editedSavedLocationText}
                            onChangeText={setEditedSavedLocationText}
                            autoCapitalize="words"
                          />
                          <View style={styles.savedLocationActions}>
                            <Pressable
                              accessibilityRole="button"
                              onPress={saveEditedSavedLocation}
                              style={styles.savedLocationAction}
                            >
                              <Text style={styles.savedLocationActionText}>
                                Salvar
                              </Text>
                            </Pressable>
                            <Pressable
                              accessibilityRole="button"
                              onPress={() => setEditingSavedLocation(null)}
                              style={styles.savedLocationAction}
                            >
                              <Text style={styles.savedLocationActionText}>
                                Cancelar
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      ) : (
                        <>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Selecionar local salvo: ${location}`}
                            accessibilityState={{ selected: isSelected }}
                            onPress={() => toggleSavedLocation(location)}
                            style={[
                              styles.savedLocationOption,
                              isSelected &&
                                styles.savedLocationOptionSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.savedLocationText,
                                isSelected &&
                                  styles.savedLocationTextSelected,
                              ]}
                            >
                              {isSelected ? '✓  ' : '+  '}
                              {location}
                            </Text>
                          </Pressable>
                          <View style={styles.savedLocationActions}>
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={`Editar local: ${location}`}
                              onPress={() => {
                                setEditingSavedLocation(location);
                                setEditedSavedLocationText(location);
                              }}
                              style={styles.savedLocationAction}
                            >
                              <Text style={styles.savedLocationActionText}>
                                Editar
                              </Text>
                            </Pressable>
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={`Excluir local: ${location}`}
                              onPress={() =>
                                confirmDeleteSavedLocation(location)
                              }
                              style={styles.savedLocationAction}
                            >
                              <Text style={styles.savedLocationActionText}>
                                Excluir
                              </Text>
                            </Pressable>
                          </View>
                        </>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
            <TextInput
              accessibilityLabel="Novo local para retirada"
              style={styles.input}
              placeholder="Digite um endereço"
              placeholderTextColor="#A6A39B"
              value={newLendingLocation}
              onChangeText={setNewLendingLocation}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleAddLendingLocation}
            />
            <Pressable
              accessibilityRole="button"
              onPress={handleAddLendingLocation}
              style={styles.addLocationButton}
            >
              <Text style={styles.addLocationButtonText}>＋ Adicionar local</Text>
            </Pressable>
            <Text style={styles.fieldHint}>
              Selecione os locais salvos ou digite um novo endereço e toque em
              Adicionar local. Locais sem seleção não serão usados neste livro.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handlePublish}
            style={({ pressed }) => [
              styles.publishButton,
              pressed && styles.publishButtonPressed,
            ]}
          >
            <Text style={styles.publishButtonText}>
              {isEditing ? 'Salvar alterações' : 'Adicionar ao catálogo'}
            </Text>
          </Pressable>
          <Text style={styles.note}>
            {isEditing
              ? 'As alterações ficam disponíveis enquanto o app estiver aberto.'
              : 'Publicações ficam disponíveis enquanto o app estiver aberto.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'decimal-pad';
};

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  keyboardType = 'default',
}: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        placeholderTextColor="#A6A39B"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
        autoCapitalize={multiline ? 'sentences' : 'words'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF9E9',
  },
  content: {
    padding: 22,
    paddingTop: 45,
    paddingBottom: 35,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    marginBottom: 22,
  },
  backText: {
    color: '#66552A',
    fontSize: 14,
    fontWeight: '700',
  },
  eyebrow: {
    color: '#9A791F',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: '#29271F',
    fontSize: 27,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    color: '#817D72',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    marginBottom: 24,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F2EBD9',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#454237',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  fieldHint: {
    color: '#817D72',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
  },
  addLocationButton: {
    minHeight: 46,
    backgroundColor: '#29271F',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addLocationButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  savedLocations: {
    gap: 8,
    marginBottom: 12,
  },
  savedLocationsLabel: {
    color: '#817D72',
    fontSize: 11,
    fontWeight: '700',
  },
  savedLocationRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 6,
  },
  savedLocationEditor: {
    flex: 1,
    gap: 8,
  },
  savedLocationOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E7DFCD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  savedLocationActions: {
    justifyContent: 'center',
    gap: 6,
  },
  savedLocationAction: {
    borderWidth: 1,
    borderColor: '#E7DFCD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
  },
  savedLocationActionText: {
    color: '#66552A',
    fontSize: 11,
    fontWeight: '700',
  },
  savedLocationOptionSelected: {
    backgroundColor: '#FFF1C4',
    borderColor: '#D5AA2C',
  },
  savedLocationText: {
    flexShrink: 1,
    color: '#625D51',
    fontSize: 12,
    lineHeight: 18,
  },
  savedLocationTextSelected: {
    color: '#514014',
    fontWeight: '700',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customCategoryInput: {
    marginTop: 12,
  },
  categoryOption: {
    borderWidth: 1,
    borderColor: '#E7DFCD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryOptionSelected: {
    backgroundColor: '#29271F',
    borderColor: '#29271F',
  },
  categoryOptionText: {
    color: '#625D51',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#EAE7DF',
    borderRadius: 11,
    paddingHorizontal: 13,
    color: '#29271F',
    backgroundColor: '#FFFEFC',
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 105,
    paddingTop: 13,
  },
  imagePicker: {
    minHeight: 130,
    borderWidth: 1,
    borderColor: '#EAE7DF',
    borderStyle: 'dashed',
    borderRadius: 11,
    backgroundColor: '#FFFEFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    color: '#98771D',
    fontSize: 14,
    fontWeight: '700',
  },
  changeImageText: {
    color: '#66552A',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 10,
  },
  publishButton: {
    minHeight: 52,
    backgroundColor: '#F1C43F',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  publishButtonPressed: {
    backgroundColor: '#EABD34',
    opacity: 0.9,
  },
  publishButtonText: {
    color: '#302817',
    fontSize: 15,
    fontWeight: '800',
  },
  note: {
    color: '#817D72',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 12,
  },
});
