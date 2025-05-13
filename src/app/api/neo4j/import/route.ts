import { NextRequest, NextResponse } from 'next/server';
import { importKnowledgeData } from '@/lib/neo4j/import-data';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400 }
      );
    }

    // 将文件保存到临时目录
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(tmpdir(), 'temp-import.json');
    await writeFile(tempPath, buffer);

    // 导入数据
    await importKnowledgeData(tempPath);

    // 获取导入结果
    const result = {
      entities: 0,
      relationships: 0
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('导入错误:', error);
    return NextResponse.json(
      { error: '导入过程中发生错误' },
      { status: 500 }
    );
  }
} 