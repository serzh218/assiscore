import { NextRequest, NextResponse } from 'next/server';

declare global {
  var viteErrors: any[];
}

// Initialize global viteErrors array if it doesn't exist
if (!global.viteErrors) {
  global.viteErrors = [];
}

export async function POST(request: NextRequest) {
  try {
    const { error, file, type = 'runtime-error' } = await request.json();
    
    if (!error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Требуется сообщение об ошибке'
      }, { status: 400 });
    }
    
    // Parse the error to extract useful information
    const errorObj: any = {
      type,
      message: error,
      file: file || 'unknown',
      timestamp: new Date().toISOString()
    };
    
    // Extract import information if it's an import error
    const importMatch = error.match(/Failed to resolve import ['"]([^'"]+)['"] from ['"]([^'"]+)['"]/);
    if (importMatch) {
      errorObj.type = 'import-error';
      errorObj.import = importMatch[1];
      errorObj.file = importMatch[2];
    }
    
    // Add to global errors array
    global.viteErrors.push(errorObj);
    
    // Keep only last 50 errors
    if (global.viteErrors.length > 50) {
      global.viteErrors = global.viteErrors.slice(-50);
    }
    
    console.log('[report-vite-error] Ошибка отправлена:', errorObj);
    
    return NextResponse.json({
      success: true,
      message: 'Ошибка успешно отправлена',
      error: errorObj
    });
    
  } catch (error) {
    console.error('[report-vite-error] Ошибка:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}