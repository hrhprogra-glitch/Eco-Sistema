import React from 'react';
import { Save, FilePlus2, Trash2 } from 'lucide-react';
import { FloatingWindow } from './FloatingWindow';
import { ModuleActions, type ModuleAction } from './ModuleActions';
import styles from './FormLayout.module.css';

interface FormLayoutProps {
  children: React.ReactNode;
  title?: string;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  onSaveAndNew?: () => void;
  isSaving?: boolean;
  width?: number;
  extraActions?: ModuleAction[];
}

export function FormLayout({
  children,
  title = 'Formulario',
  onSave,
  onCancel,
  onDelete,
  onSaveAndNew,
  isSaving = false,
  width = 860,
  extraActions = [],
}: FormLayoutProps) {
  const actions: ModuleAction[] = [
    { key: 'guardar', icon: Save, label: 'Guardar y cerrar', onClick: onSave, disabled: isSaving, tone: 'primary' },
    ...(onSaveAndNew
      ? [{ key: 'guardar-nuevo', icon: FilePlus2, label: 'Guardar y nuevo', onClick: onSaveAndNew, disabled: isSaving }]
      : []),
    ...(onDelete
      ? [{ key: 'eliminar', icon: Trash2, label: 'Eliminar', onClick: onDelete, disabled: isSaving, tone: 'danger' as const }]
      : []),
    ...extraActions,
  ];

  return (
    <FloatingWindow title={title} onClose={onCancel} width={width}>
      <div className={styles.ribbonWrap}>
        <ModuleActions actions={actions} variant="inline" />
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </FloatingWindow>
  );
}
