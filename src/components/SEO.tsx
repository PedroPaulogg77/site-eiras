import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
    image?: string;
    url?: string;
}

export const SEO = ({
    title,
    description,
    name = "Eiras Consultoria",
    type = "website",
    image = "https://eirasconsultoria.com.br/og-image.jpg",
    url = "https://eirasconsultoria.com.br"
}: SEOProps) => {
    const defaultTitle = "Eiras Consultoria | Sua Ponte para o Mercado Brasileiro";
    const defaultDescription = "Consultoria especializada em contabilidade, tributação e administração para empresas internacionais que buscam crescer no Brasil. Mais de 20 anos de experiência.";

    const finalTitle = title ? `${title} | ${name}` : defaultTitle;
    const finalDescription = description || defaultDescription;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{finalTitle}</title>
            <meta name='description' content={finalDescription} />

            {/* Open Graph tags (Facebook, LinkedIn, etc.) */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDescription} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};
