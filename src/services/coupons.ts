import { supabase } from '@/lib/supabase';
import { Coupon } from '@/types';

interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
}

export const couponService = {
  validate: async (code: string): Promise<ValidateCouponResponse> => {
    const { data, error } = await supabase.rpc('validate_coupon', { p_code: code });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || !row.valid) return { valid: false };

    return {
      valid: true,
      coupon: {
        id: '',
        code: row.code,
        type: row.type,
        discount: Number(row.discount || 0),
        validUntil: '',
        maxUses: 0,
        currentUses: 0,
        usesPerClient: 0,
        active: true,
      },
    };
  },
};
