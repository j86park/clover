/**
 * Tenant-Scoped Query Helpers
 * Ensures all data queries are properly scoped to the authenticated tenant
 */

import { createClient } from '@/lib/supabase/server';
import { ForbiddenError, NotFoundError } from './errors';

/**
 * Get brands for the authenticated tenant
 */
export async function getTenantBrands(tenantId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', tenantId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch brands: ${error.message}`);
    }

    return data || [];
}

/**
 * Get a single brand, verifying tenant ownership
 */
export async function getTenantBrand(tenantId: string, brandId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single();

    if (error || !data) {
        throw new NotFoundError('Brand not found');
    }

    // Verify tenant owns this brand
    if (data.id !== tenantId) {
        throw new ForbiddenError('Access denied to this brand');
    }

    return data;
}

/**
 * Get collections for the authenticated tenant's brands
 */
export async function getTenantCollections(tenantId: string, limit = 50) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('collections')
        .select(`*, brands (name)`)
        .eq('brand_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        throw new Error(`Failed to fetch collections: ${error.message}`);
    }

    return data || [];
}

/**
 * Get a single collection, verifying tenant ownership
 */
export async function getTenantCollection(tenantId: string, collectionId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('collections')
        .select(`*, brands (name, domain)`)
        .eq('id', collectionId)
        .single();

    if (error || !data) {
        throw new NotFoundError('Collection not found');
    }

    // Verify tenant owns the brand this collection belongs to
    if (data.brand_id !== tenantId) {
        throw new ForbiddenError('Access denied to this collection');
    }

    return data;
}

/**
 * Get metrics for a collection, verifying tenant ownership
 */
export async function getTenantMetrics(tenantId: string, collectionId: string) {
    const supabase = await createClient();

    // First verify the collection belongs to the tenant
    const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .select('id, brand_id')
        .eq('id', collectionId)
        .single();

    if (collectionError || !collection) {
        throw new NotFoundError('Collection not found');
    }

    if (collection.brand_id !== tenantId) {
        throw new ForbiddenError('Access denied to this collection');
    }

    // Fetch metrics
    const { data: metrics, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .eq('collection_id', collectionId);

    if (metricsError) {
        throw new Error(`Failed to fetch metrics: ${metricsError.message}`);
    }

    return metrics || [];
}

/**
 * Verify user has access to perform write operations on a brand
 */
export async function verifyTenantWriteAccess(tenantId: string, brandId: string): Promise<boolean> {
    // In this simplified model, tenant_id == brand_id for the primary brand
    // For a multi-brand tenant model, this would check a tenant_brands junction table
    return tenantId === brandId;
}
