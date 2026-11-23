import {expect,it} from 'vitest';
import {CAMPAIGN} from './campaign';
import {initialPaymentDue,operationDocumentNumber} from './payment-plan';
it('uses the supplied bank account',()=>expect(CAMPAIGN.payment.iban).toBe('ES61 2100 1841 0102 0059 5239'));
it('identifies single operation 17 as U0017',()=>expect(operationDocumentNumber(17,'single','single')).toBe('U0017'));
it('identifies advance operation 17 as M0017.1',()=>expect(operationDocumentNumber(17,'split','advance')).toBe('M0017.1'));
it('identifies final operation 17 as M0017.2',()=>expect(operationDocumentNumber(17,'split','final')).toBe('M0017.2'));
it('uses 0018 for the next operation regardless of modality',()=>expect(operationDocumentNumber(18,'single','single')).toBe('U0018'));
it('skips weekends for three business days',()=>expect(initialPaymentDue('2026-11-19')).toBe('2026-11-24'));