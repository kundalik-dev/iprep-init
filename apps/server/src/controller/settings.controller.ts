import type { Request, Response } from 'express';
import { SettingsQuery, UserQuery } from '@iprep/db';

export class SettingsController {
  // --- Preferences ---
  static async getPreferences(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const preferences = await SettingsQuery.getPreferences(userId);
      res.json({ success: true, data: preferences });
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updatePreferences(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const preferences = req.body;
      const updatedUser = await SettingsQuery.updatePreferences(userId, preferences);
      
      res.json({ success: true, data: updatedUser.preferences });
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // --- Providers ---
  static async getProviders(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const providers = await SettingsQuery.getProviders(userId);
      res.json({ success: true, data: providers });
    } catch (error: any) {
      console.error('Error fetching providers:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async upsertProvider(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const providerData = req.body;
      // Note: Encryption logic should happen here if an API key is provided
      // For simplicity in this wiring phase, we pass it down
      const result = await SettingsQuery.upsertProvider(userId, providerData);
      
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error upserting provider:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteProvider(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const providerId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      await SettingsQuery.deleteProvider(providerId, userId);
      
      res.json({ success: true, message: 'Provider deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting provider:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
