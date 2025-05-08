import { useState, useCallback } from 'react';
import axiosInstance from '@/config/axios';
import { toast } from 'sonner';

export const useDataFetching = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (dtgValues, dmhValues, dkhValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const sendData = {
        Dim_Time: dtgValues,
        Dim_Item: dmhValues,
        Dim_Customer: dkhValues,
      };

      const { data: responseData } = await axiosInstance.post("/api/cube", sendData);

      // Xử lý dữ liệu trùng lặp một cách hiệu quả
      const cleanData = Array.from(
        new Set(responseData.validData.map((item) => JSON.stringify(item)))
      ).map((str) => JSON.parse(str));

      setData(cleanData);

      toast.success("Dữ liệu đã được cập nhật thành công!", {
        description: `Đã tải ${cleanData.length} bản ghi`,
        duration: 3000,
        position: "top-right",
      });

      return cleanData;
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
      toast.error("Không thể tải dữ liệu!", {
        description: error.response?.data?.message || "Vui lòng kiểm tra kết nối và thử lại",
        duration: 3000,
        position: "top-right",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    fetchData
  };
}; 