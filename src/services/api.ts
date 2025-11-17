import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Caption {
    id: string;
    start: number;
    end: number;
    text: string;
}

export interface Video {
    id: string;
    url: string;
    filename: string;
}

export interface UploadVideoResponse {
    success: boolean;
    video: Video;
}

export interface GenerateCaptionsRequest {
    videoUrl: string;
    videoId?: string;
}

export interface GenerateCaptionsResponse {
    captions: Caption[];
}

// Define the base URL for the API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    tagTypes: ['Video', 'Captions', 'Export'],
    endpoints: (builder) => ({
        // Upload video
        uploadVideo: builder.mutation<UploadVideoResponse, FormData>({
            query: (formData) => ({
                url: '/videos/upload',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Video'],
        }),

        // Generate captions
        generateCaptions: builder.mutation<GenerateCaptionsResponse, GenerateCaptionsRequest>({
            query: (body) => ({
                url: '/captions/generate',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Captions'],
        }),

        // Get captions for a video
        getCaptions: builder.query<GenerateCaptionsResponse, string>({
            query: (videoId) => `/captions/${videoId}`,
            providesTags: ['Captions'],
        }),

        // Update captions
        updateCaptions: builder.mutation<GenerateCaptionsResponse, { videoId: string; captions: Caption[] }>({
            query: ({ videoId, captions }) => ({
                url: `/captions/${videoId}`,
                method: 'PUT',
                body: { captions },
            }),
            invalidatesTags: ['Captions'],
        }),
        exportVideo: builder.mutation<
            { downloadUrl: string; filename?: string },
            { videoUrl: string; videoId?: string; captions: Caption[]; captionStyle: string }
        >({
            query: ({ videoUrl, videoId, captions, captionStyle }) => ({
                url: '/export/video',
                method: 'POST',
                body: {
                    videoUrl,
                    videoId,
                    captions,
                    captionStyle,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
            invalidatesTags: ['Export'],
        }),
    }),
});

export const {
    useUploadVideoMutation,
    useGenerateCaptionsMutation,
    useGetCaptionsQuery,
    useUpdateCaptionsMutation,
    useExportVideoMutation,
} = api;