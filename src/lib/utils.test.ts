import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
    describe('cn', () => {
        it('should merge class names correctly', () => {
            const result = cn('c-red', 'c-bold');
            expect(result).toBe('c-red c-bold');
        });

        it('should handle conditional classes', () => {
            const result = cn('c-red', false && 'c-bold', true && 'c-italic');
            expect(result).toBe('c-red c-italic');
        });

        it('should resolve tailwind conflicts', () => {
            const result = cn('bg-red-500', 'bg-blue-500');
            expect(result).toBe('bg-blue-500');
        });
    });
});
