import SitemapService from "@/services/sitemap/sitemap.service";
import { Request, Response } from "express";

class SitemapController {
  private service = new SitemapService();

  public generateSitemap = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const response = await this.service.generateSitemap();

      res.header("Content-Type", "application/xml");
      res.header("Content-Encoding", "gzip");

      res.send(response);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

export default SitemapController;
