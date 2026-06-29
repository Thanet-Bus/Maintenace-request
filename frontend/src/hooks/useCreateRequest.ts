import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

interface CreateRequestParams {
  category: string;
  title: string;
  location: string;
  details: string;
  phone: string;
  imageFile: File | null;
}

export function useCreateRequest() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = async (params: CreateRequestParams) => {
    const { category, title, location, details, phone, imageFile } = params;
    
    setIsSubmitting(true);
    setError(null);

    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userStr);

    const fullDescription = `หมวดหมู่: ${category}\nเบอร์ติดต่อ: ${phone}\nรายละเอียด: ${details}`;

    const requestData = {
      title: title,
      location: location,
      description: fullDescription,
    };

    try {
      const createdRequest = await apiClient('/repair-requests', {
        method: 'POST',
        data: requestData,
      });

      if (imageFile) {
        const formData = new FormData();
        formData.append('repair_request_id', createdRequest.id.toString());
        formData.append('image_type', 'REQUEST');
        formData.append('uploaded_by', user.id.toString());
        formData.append('file', imageFile);

        try {
          await apiClient('/repair-images', {
            method: 'POST',
            data: formData,
          });
        } catch (imgErr) {
          console.warn('Repair request created, but image upload failed', imgErr);
        }
      }

      navigate('/dashboard');
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while create request.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createRequest, isSubmitting, error, setError };
}
