import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspace_id') || 'default'

    const { data: files, error } = await supabase
      .from('ai_workspace_files')
      .select('*')
      .eq('user_id', user.id)
      .eq('workspace_id', workspaceId)
      .order('file_path')

    if (error) {
      console.error('Files fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ files: files || [] })
  } catch (error) {
    console.error('Files API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { file_path, file_name, content, language, workspace_id } = body

    if (!file_path || !file_name) {
      return NextResponse.json({ error: 'file_path and file_name are required' }, { status: 400 })
    }

    const workspaceId = workspace_id || 'default'

    const { data: file, error } = await supabase
      .from('ai_workspace_files')
      .upsert({
        user_id: user.id,
        workspace_id: workspaceId,
        file_path,
        file_name,
        content: content || '',
        language: language || 'plaintext',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,workspace_id,file_path',
      })
      .select()
      .single()

    if (error) {
      console.error('File upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ file })
  } catch (error) {
    console.error('Files POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')
    const filePath = searchParams.get('file_path')

    if (!fileId && !filePath) {
      return NextResponse.json({ error: 'id or file_path required' }, { status: 400 })
    }

    let query = supabase
      .from('ai_workspace_files')
      .delete()
      .eq('user_id', user.id)

    if (fileId) {
      query = query.eq('id', fileId)
    } else if (filePath) {
      query = query.eq('file_path', filePath)
    }

    const { error } = await query

    if (error) {
      console.error('File delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Files DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
