-- Migración: Agregar columna deposito a tabla registro_aportes
ALTER TABLE registro_aportes ADD COLUMN IF NOT EXISTS deposito DECIMAL(10, 2) DEFAULT 0;
