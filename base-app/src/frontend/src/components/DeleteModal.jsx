import React from 'react';
import { TriangleAlert, X } from 'lucide-react';

const DeleteModal = ({ isOpen, onConfirm, onCancel, carName }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                width: '100%', maxWidth: '400px',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                position: 'relative'
            }}>
                <button 
                    onClick={onCancel}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                        color: '#ef4444'
                    }}>
                        <TriangleAlert size={32} />
                    </div>

                    <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Confirm Deletion
                    </h3>
                    
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        Are you sure you want to delete <strong style={{ color: 'var(--text-main)' }}>{carName}</strong>? 
                        This action cannot be undone.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                    <button 
                        onClick={onCancel}
                        className="btn btn-slate"
                        style={{ padding: '0.85rem', fontWeight: 700 }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="btn"
                        style={{ padding: '0.85rem', fontWeight: 700, background: '#ef4444' }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
