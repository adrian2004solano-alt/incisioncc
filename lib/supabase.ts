
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabaseUrl = 'https://cmcjjiahujluylkrbdff.supabase.co';
const supabaseKey = 'sb_publishable_yJhrpV_XFFaqhbtaDcmxOw_Cr6h2k6l';

export const supabase = createClient(supabaseUrl, supabaseKey);
