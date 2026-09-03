import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { PixelTracker } from "@/components/tracking/pixel-tracker";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OPAL — The Trading Operating System",
  description:
    "OPAL centralise la formation, le journal de trading, les outils, la communauté et l'accompagnement pour les traders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        {/* Whop Pixel (Business ID: biz_B69xbdKu6D1sMB) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_B69xbdKu6D1sMB");whop.track("page");`,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <PixelTracker />
        {children}
      </body>
    </html>
  );
}
