import { NewsRepo } from "@/repository/news.repo";
import { Response } from "express";
import {
  SitemapStream,
  streamToPromise,
  SitemapItemLoose,
  EnumChangefreq,
} from "sitemap";
import { createGzip } from "zlib";

class SitemapService {
  private newsRepo = new NewsRepo();

  public async generateSitemap(): Promise<Buffer> {
    const smStream = new SitemapStream({
      hostname: "https://avitsennamaktabi.uz",
    });
    const pipeline = smStream.pipe(createGzip());

    const staticPages: SitemapItemLoose[] = [
      { url: "/", changefreq: EnumChangefreq.WEEKLY, priority: 1.0 },
      {
        url: "/leaderships",
        changefreq: EnumChangefreq.WEEKLY,
        priority: 1.0,
      },
      { url: "/classes", changefreq: EnumChangefreq.WEEKLY, priority: 1.0 },
      { url: "/news", changefreq: EnumChangefreq.WEEKLY, priority: 1.0 },
      {
        url: "/achievements",
        changefreq: EnumChangefreq.WEEKLY,
        priority: 1.0,
      },
      { url: "/galleries", changefreq: EnumChangefreq.WEEKLY, priority: 1.0 },
    ];

    staticPages.forEach((page) => smStream.write(page));

    const news = await this.newsRepo.getMany({});

    news.forEach((item) => {
      smStream.write({
        url: `/news/${item.slug}`,
        changefreq: EnumChangefreq.WEEKLY,
        priority: 0.8,
      });
    });

    smStream.end();

    return streamToPromise(pipeline);
  }
}

export default SitemapService;
