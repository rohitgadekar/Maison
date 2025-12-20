import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
}

export const SEO = ({ title, description, image }: SEOProps) => {
    const siteTitle = "MAISON - Premium Archival Archive";
    const defaultDescription = "Discover the curated collection of premium archival artifacts.";

    return (
        <Helmet>
            <title>{title} | {siteTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            {image && <meta property="og:image" content={image} />}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
    );
};
