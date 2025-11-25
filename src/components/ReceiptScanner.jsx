import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function ReceiptScanner({ onItemsParsed, onClose }) {
  const { token } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a receipt image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('receipt', selectedFile);

      const response = await fetch('http://localhost:5001/api/receipt/parse', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        onItemsParsed(data.items);
      } else {
        setError(data.message || 'Failed to process receipt');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-3xl">📸</span>
                Scan Receipt
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Upload a photo of your grocery receipt
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Upload Area */}
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-3 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-400 transition cursor-pointer"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload" className="cursor-pointer">
                <div className="text-6xl mb-4">🖼️</div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <img
                  src={preview}
                  alt="Receipt preview"
                  className="max-h-96 mx-auto rounded-lg shadow-md"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPreview(null);
                    setSelectedFile(null);
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Choose Different Image
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Scan Receipt'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <span>💡</span>
              Tips for best results:
            </h3>
            <ul className="text-sm text-purple-800 space-y-1 ml-6 list-disc">
              <li>Ensure the entire receipt is visible and in focus</li>
              <li>Use good lighting to avoid shadows</li>
              <li>Lay the receipt flat on a surface</li>
              <li>Make sure text is readable and not blurry</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceiptScanner;
