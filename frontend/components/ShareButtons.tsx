import {
    FacebookShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    TelegramShareButton,
    FacebookIcon,
    TwitterIcon,
    WhatsappIcon,
    TelegramIcon,
    
} from "react-share";

interface ShareButtonsProps {
    url: string;
    title: string;
}

function ShareButtons({ url, title }: ShareButtonsProps) {
    return (
        <div className="share-buttons flex gap-2 p-1">
            <TelegramShareButton url={url} title={title}>
                <TelegramIcon size={32} round />
            </TelegramShareButton>

            <FacebookShareButton {...({ url, quote: title } as any)}>
                <FacebookIcon size={32} round />
            </FacebookShareButton>

            <TwitterShareButton url={url} title={title}>
                <TwitterIcon size={32} round />
            </TwitterShareButton>

            <WhatsappShareButton url={url} title={title}>
                <WhatsappIcon size={32} round />
            </WhatsappShareButton>
        </div>
    );
}

export default ShareButtons;
