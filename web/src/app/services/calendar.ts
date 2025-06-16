import { TalkType } from "../types/talks";

const API_URL = 'http://localhost:3000/api/v1';

export type GetTalksResponseType = {
  talks: TalkType[];
  total: number;
}

export const getTalks = async (): Promise<GetTalksResponseType> => {
  try {
    const response = await fetch(`${API_URL}/talks`);
    
    if (!response.ok) {
      throw new Error(`Calendar API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch calendar data:', error);
    throw error;
  }
}
