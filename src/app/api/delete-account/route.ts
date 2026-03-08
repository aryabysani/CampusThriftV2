import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')

  // Admin client
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verify the token and get user
  const { data: { user }, error: authError } = await adminClient.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Get user's listing IDs first
  const { data: userListings } = await adminClient
    .from('listings')
    .select('id')
    .eq('seller_id', user.id)

  // Delete listing images from storage (only this user's)
  if (userListings && userListings.length > 0) {
    const listingIds = userListings.map((l: { id: string }) => l.id)
    const { data: images } = await adminClient
      .from('listing_images')
      .select('storage_path')
      .in('listing_id', listingIds)

    if (images && images.length > 0) {
      const paths = images
        .map((img: { storage_path: string }) => img.storage_path)
        .filter(Boolean)
      if (paths.length > 0) {
        await adminClient.storage.from('listing-images').remove(paths)
      }
    }
  }

  // Delete listings
  await adminClient.from('listings').delete().eq('seller_id', user.id)

  // Delete profile
  await adminClient.from('profiles').delete().eq('id', user.id)

  // Delete auth user
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}