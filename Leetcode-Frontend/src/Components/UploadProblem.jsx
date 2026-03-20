import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';

export default function UploadProblem() {

  const { problemId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [uploadingprogress, setUploadingProgress] = useState(0);
  const [uploadedvideo, setUploadedVideo] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm();

  const selectionFile = watch('videoFile')?.[0];

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const onSubmit = async (data) => {
    const file = data.videoFile[0];

    setUploading(true);
    setUploadingProgress(0);
    clearErrors();

    try {
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);

      const {
        signature,
        timestamp,
        public_id,
        api_key,
        upload_url
      } = signatureResponse.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (ProgressEvent) => {
          const progress = Math.round((ProgressEvent.loaded * 100) / ProgressEvent.total);
          setUploadingProgress(progress);
        }
      });

      const cloudinaryResult = uploadResponse.data;

      const metadataResponse = await axiosClient.post('/video/save', {
        problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();

    } catch (err) {
      console.error('upload error', err);
      setError('root', {
        type: "manual",
        message: err.response?.data?.message || 'Upload failed. Please try again'
      });
    } finally {
      setUploading(false);
      setUploadingProgress(0);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">

        <h2 className="text-xl font-bold mb-4 text-center text-blue-600">
          Upload Video
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="block mb-2 font-medium text-blue-600">
              Choose your video file
            </label>

            <input
              type="file"
              accept="video/*"
              {...register("videoFile", {
                required: "Video file is required",
              })}
              className={`file-input file-input-bordered w-full ${errors.videoFile ? 'file-input-error' : ''}`}
              disabled={uploading}
            />

            {errors.videoFile && (
              <p className="text-red-500 text-sm">
                {errors.videoFile.message}
              </p>
            )}
          </div>

          {selectionFile && (
            <div className='alert alert-info'>
              <p>{selectionFile.name}</p>
              <p>{formatFileSize(selectionFile.size)}</p>
            </div>
          )}

            {uploading && (
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-blue-600">
                <span>Uploading...</span>
                <span>{uploadingprogress}%</span>
                </div>

                <progress
                value={uploadingprogress}
                max="100"
                className="progress progress-primary w-full"
                ></progress>
            </div>
            )}

          {errors.root && (
            <p className="text-red-500">{errors.root.message}</p>
          )}

          {uploadedvideo && !uploading && (
                <div className="alert alert-success">
                    <div>
                    <h3 className="font-bold">✅ Uploaded Successfully!</h3>
                    <p className="text-sm">
                        Duration: {formatDuration(uploadedvideo.duration)}
                    </p>
                    <p className="text-sm">
                        Uploaded At: {new Date(uploadedvideo.uploadedAt).toLocaleDateString()}
                    </p>
                    </div>
                </div>
            )}

          <button
            type="submit"
            disabled={uploading}
            className={`btn btn-primary w-full ${uploading ? 'loading' : ''}`}
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>

        </form>
      </div>
    </div>
  );
}