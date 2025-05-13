import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Download } from "lucide-react";

export function DataImport() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('请选择有效的 JSON 文件');
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('请先选择文件');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/neo4j/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('导入失败：' + response.statusText);
      }

      const result = await response.json();
      setSuccess(`成功导入 ${result.entities} 个实体和 ${result.relationships} 个关系`);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const response = await fetch('/data/sample/ai_knowledge.json');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai_knowledge.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('下载示例数据失败');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Neo4j 数据导入</h2>
        <p className="text-gray-500">
          选择 JSON 文件导入到 Neo4j 数据库。文件格式应包含 entities 和 relationships 数组。
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="file">选择 JSON 文件</Label>
          <Input
            id="file"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleImport}
            disabled={!file || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在导入...
              </>
            ) : (
              '开始导入'
            )}
          </Button>

          <Button
            onClick={handleDownloadSample}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            下载示例数据
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertTitle>成功</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
} 