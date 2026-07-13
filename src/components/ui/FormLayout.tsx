import React from 'react';
import { Save, FilePlus2, Trash2 } from 'lucide-react';
import { FloatingWindow } from './FloatingWindow';
import { Ribbon, type RibbonGroup } from './Ribbon';
import styles from './FormLayout.module.css';

interface FormLayoutProps {
  children: React.ReactNode;
  title?: string;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  onSaveAndNew?: () => void;
  isSaving?: boolean;
}

export function FormLayout({
  children,
  title = 'Formulario',
  onSave,
  onCancel,
  onDelete,
  onSaveAndNew,
  isSaving = false,
}: FormLayoutProps) {
  const groups: RibbonGroup[] = [
    {
      label: 'Mantenimiento',
      buttons: [
        { key: 'guardar', icon: Save, label: 'Guardar y cerrar', onClick: onSave, disabled: isSaving },
        ...(onSaveAndNew
          ? [{ key: 'guardar-nuevo', icon: FilePlus2, label: 'Guardar y nuevo', onClick: onSaveAndNew, disabled: isSaving }]
          : []),
        ...(onDelete
          ? [{ key: 'eliminar', icon: Trash2, label: 'Eliminar', onClick: onDelete, disabled: isSaving, tone: 'danger' as const }]
          : []),
      ],
    },
  ];

  return (
    <FloatingWindow title={title} onClose={onCancel} width={860}>
      <div className={styles.ribbonWrap}>
        <Ribbon groups={groups} />
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </FloatingWindow>
  );
}
