import React from 'react';
import styles from './FormLayout.module.css';

interface FormLayoutProps {
  children: React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function FormLayout({ children, onSave, onCancel, isSaving = false }: FormLayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button 
          className={styles.btnSave} 
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
        <button 
          className={styles.btnCancel} 
          onClick={onCancel}
          disabled={isSaving}
        >
          Descartar
        </button>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
