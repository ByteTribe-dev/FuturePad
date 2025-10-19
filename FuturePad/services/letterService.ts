import api from "./api";

export interface Letter {
  _id: string;
  userId: string;
  title: string;
  content: string;
  mood: "happy" | "sad" | "excited" | "anxious" | "grateful" | "reflective" | "calm" | "refresh";
  deliveryDate: string;
  isDelivered: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  images?: {
    url: string;
    publicId: string;
    caption: string;
  }[];
  featuredImage?: {
    url: string;
    publicId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateLetterData {
  title: string;
  content: string;
  deliveryDate: string;
  mood?: Letter["mood"];
  images?: {
    uri: string;
    caption?: string;
  }[];
}

export interface UpdateLetterData {
  title?: string;
  content?: string;
  deliveryDate?: string;
  mood?: Letter["mood"];
}

class LetterService {
  // Get all letters for authenticated user
  async getLetters(): Promise<Letter[]> {
    try {
      const response = await api.get<{ success: boolean; count: number; letters: Letter[] }>("/letters");
      return response.data.letters;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch letters"
      );
    }
  }

  // Get single letter by ID
  async getLetter(id: string): Promise<Letter> {
    try {
      const response = await api.get<{ success: boolean; letter: Letter }>(`/letters/${id}`);
      return response.data.letter;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch letter"
      );
    }
  }

  // Create new letter with optional images
  async createLetter(letterData: CreateLetterData): Promise<Letter> {
    try {
      console.log("📝 Creating letter with data:", {
        title: letterData.title,
        contentLength: letterData.content.length,
        mood: letterData.mood,
        deliveryDate: letterData.deliveryDate,
        hasImages: letterData.images && letterData.images.length > 0,
      });

      const formData = new FormData();

      // Add text fields
      formData.append("title", letterData.title);
      formData.append("content", letterData.content);
      formData.append("deliveryDate", letterData.deliveryDate);
      if (letterData.mood) {
        formData.append("mood", letterData.mood);
      }

      // Add images if provided
      if (letterData.images && letterData.images.length > 0) {
        console.log("📸 Adding images to form data...");
        letterData.images.forEach((image, index) => {
          console.log(`📸 Processing image ${index}:`, image.uri);

          // Create file object for React Native - correct format
          const imageFile = {
            uri: image.uri,
            name: `image_${index}.jpg`,
            type: "image/jpeg", // This is correct for React Native
          } as any;

          console.log("📸 Image file object:", imageFile);
          formData.append("images", imageFile);

          if (image.caption) {
            formData.append(`imageCaption${index}`, image.caption);
          }
        });

        console.log("📸 FormData prepared with images");
      }

      console.log("🚀 Sending request to server...");
      const response = await api.post<{ success: boolean; message: string; letter: Letter }>("/letters", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // Increase timeout to 30 seconds for image uploads
      });

      console.log("✅ Letter created successfully:", response.data.letter);
      return response.data.letter;
    } catch (error: any) {
      console.error("❌ Failed to create letter:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create letter"
      );
    }
  }

  // Update existing letter
  async updateLetter(
    id: string,
    letterData: UpdateLetterData
  ): Promise<Letter> {
    try {
      const response = await api.put<{ success: boolean; message: string; letter: Letter }>(`/letters/${id}`, letterData);
      return response.data.letter;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update letter"
      );
    }
  }

  // Soft delete letter (move to trash)
  async deleteLetter(id: string): Promise<void> {
    try {
      await api.delete(`/letters/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete letter"
      );
    }
  }

  // Permanently delete letter (cannot be undone)
  async permanentlyDeleteLetter(id: string): Promise<void> {
    try {
      await api.delete(`/letters/${id}/permanent`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to permanently delete letter"
      );
    }
  }

  // Restore soft-deleted letter
  async restoreLetter(id: string): Promise<Letter> {
    try {
      const response = await api.patch<{ message: string; letter: Letter }>(
        `/letters/${id}/restore`
      );
      return response.data.letter;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to restore letter"
      );
    }
  }

  // Get soft-deleted letters (trash)
  async getDeletedLetters(): Promise<Letter[]> {
    try {
      const response = await api.get<{ success: boolean; count: number; letters: Letter[] }>("/letters/trash/all");
      return response.data.letters;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch deleted letters"
      );
    }
  }

  // Get letters by delivery status
  async getLettersByStatus(isDelivered: boolean): Promise<Letter[]> {
    try {
      const letters = await this.getLetters();
      return letters.filter((letter) => letter.isDelivered === isDelivered);
    } catch (error) {
      throw error;
    }
  }

  // Get letters by mood
  async getLettersByMood(mood: Letter["mood"]): Promise<Letter[]> {
    try {
      const letters = await this.getLetters();
      return letters.filter((letter) => letter.mood === mood);
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming letters (not yet delivered)
  async getUpcomingLetters(): Promise<Letter[]> {
    try {
      const letters = await this.getLetters();
      const now = new Date();
      return letters.filter(
        (letter) => !letter.isDelivered && new Date(letter.deliveryDate) > now
      );
    } catch (error) {
      throw error;
    }
  }

  // Get overdue letters (should have been delivered but weren't)
  async getOverdueLetters(): Promise<Letter[]> {
    try {
      const letters = await this.getLetters();
      const now = new Date();
      return letters.filter(
        (letter) => !letter.isDelivered && new Date(letter.deliveryDate) <= now
      );
    } catch (error) {
      throw error;
    }
  }

  // Delete specific image from letter
  async deleteLetterImage(
    letterId: string,
    imageIndex: number
  ): Promise<Letter> {
    try {
      const response = await api.delete<{ message: string; letter: Letter }>(
        `/letters/${letterId}/images/${imageIndex}`
      );
      return response.data.letter;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete image"
      );
    }
  }
}

export default new LetterService();
