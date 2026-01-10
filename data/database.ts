// data/database.ts
import { Platform } from 'react-native';

export * from Platform.OS === 'web' ? './database.web' : './database.native';