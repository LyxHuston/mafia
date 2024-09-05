import React, { JSXElementConstructor, ReactElement, useRef, createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import "../index.css";
import "./anchor.css";
import translate, { switchLanguage } from "../game/lang";
import GlobalMenu from "./GlobalMenu";
import SettingsMenu from './Settings';
import { loadSettings } from "../game/localStorage";
import LoadingScreen from "./LoadingScreen";
import { Theme } from "..";
import Icon from "../components/Icon";
import { Button } from "../components/Button";
import { ChatMessage } from "../components/ChatMessage";
import WikiCoverCard from "../components/WikiCoverCard";
import WikiArticle from "../components/WikiArticle";
import AudioController from "./Audio";

const MobileContext = createContext<boolean | undefined>(undefined);

type AnchorController = {
    reload: () => void,
    setContent: (content: JSX.Element) => void,
    contentType: string | JSXElementConstructor<any>,
    setCoverCard: (content: JSX.Element) => void,
    clearCoverCard: () => void,
    pushErrorCard: (error: ErrorData) => void,
    openGlobalMenu: () => void,
    closeGlobalMenu: () => void,
}

const AnchorControllerContext = createContext<AnchorController | undefined>(undefined);

export { MobileContext, AnchorControllerContext };

const MIN_SWIPE_DISTANCE = 40;
const MOBILE_MAX_WIDTH_PX = 600;

/**
 * @deprecated Use AnchorControllerContext if you can
 */
let ANCHOR_CONTROLLER: AnchorController | null = null;

export { ANCHOR_CONTROLLER };

export default function Anchor(props: Readonly<{
    children: JSX.Element
    onMount: () => void,
}>): ReactElement {
    const [mobile, setMobile] = useState<boolean>(false);

    useEffect(() => {
        const onResize = () => setMobile(window.innerWidth <= MOBILE_MAX_WIDTH_PX)
        onResize();

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [])

    const [children, setChildren] = useState<JSX.Element>(props.children);
    const [setChildrenCallbacks, setSetChildrenCallbacks] = useState<(() => void)[]>([]);

    useEffect(() => {
        for (const callback of setChildrenCallbacks) {
            callback()
        }
        if (setChildrenCallbacks.length !== 0) {
            setSetChildrenCallbacks([])
        }
    }, [setChildrenCallbacks])

    const [coverCard, setCoverCard] = useState<JSX.Element | null>(null);
    const [coverCardTheme, setCoverCardTheme] = useState<Theme | null>(null);
    const [setCoverCardCallbacks, setSetCoverCardCallbacks] = useState<(() => void)[]>([])

    useEffect(() => {
        for (const callback of setCoverCardCallbacks) {
            callback()
        }
        if (setCoverCardCallbacks.length !== 0) {
            setSetCoverCardCallbacks([])
        }
    }, [setCoverCardCallbacks])

    const [errorCard, setErrorCard] = useState<JSX.Element | null>(null);
    const [setErrorCardCallbacks, setSetErrorCardCallbacks] = useState<(() => void)[]>([])

    useEffect(() => {
        for (const callback of setErrorCardCallbacks) {
            callback()
        }
        if (setErrorCardCallbacks.length !== 0) {
            setSetErrorCardCallbacks([])
        }
    }, [setErrorCardCallbacks])

    const [globalMenuOpen, setGlobalMenuOpen] = useState<boolean>(false);

    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);

    // Load settings
    useEffect(() => {
        const settings = loadSettings();

        AudioController.setVolume(settings.volume);
        switchLanguage(settings.language)
    }, [])

    const reload = useCallback(() => {
        setSetChildrenCallbacks(setChildrenCallbacks =>
            setChildrenCallbacks.concat(() => {
                setChildren(() => children);
            }
        ));
        setChildren(<LoadingScreen type="default"/>);

        setSetCoverCardCallbacks(setCoverCardCallbacks => 
            setCoverCardCallbacks.concat(() => {
                setCoverCard(() => coverCard)
            }
        ));
        setCoverCard(null)

        setSetErrorCardCallbacks(setErrorCardCallbacks =>
            setErrorCardCallbacks.concat(() => {
                setErrorCard(() => errorCard)
            })
        )
        setErrorCard(null)
    }, [children, coverCard, errorCard])

    const anchorController = useMemo(() => ({
        reload,
        setContent: setChildren,
        contentType: children.type,
        setCoverCard: (coverCard: JSX.Element, callback?: () => void) => {
            let coverCardTheme: Theme | null = null;
            if (coverCard.type === WikiCoverCard || coverCard.type === WikiArticle) {
                coverCardTheme = "wiki-menu-colors"
            } else if (coverCard.type === SettingsMenu) {
                coverCardTheme = "graveyard-menu-colors"
            }

            if (callback) {
                setSetCoverCardCallbacks(setCoverCardCallbacks => 
                    setCoverCardCallbacks.concat(callback)
                );
            }
            setCoverCard(coverCard)
            setCoverCardTheme(coverCardTheme);
        },
        pushErrorCard: (error: ErrorData) => {
            setErrorCard(<ErrorCard
                onClose={() => setErrorCard(null)}
                error={error}
            />);
        },
        clearCoverCard: () => {
            setCoverCard(null);
            setCoverCardTheme(null);
        },
        openGlobalMenu: () => setGlobalMenuOpen(true),
        closeGlobalMenu: () => setGlobalMenuOpen(false),
    }), [reload, children])

    useEffect(() => {
        ANCHOR_CONTROLLER = anchorController
    }, [anchorController])

    useEffect(() => {
        props.onMount();
    }, [props])
    
    return <MobileContext.Provider value={mobile} >
        <AnchorControllerContext.Provider value={anchorController}>
            <div
                className="anchor"
                onTouchStart={(e) => {
                    setTouchStartX(e.targetTouches[0].clientX)
                    setTouchCurrentX(e.targetTouches[0].clientX)
                }}
                onTouchMove={(e) => {
                    setTouchCurrentX(e.targetTouches[0].clientX)
                }}
                onTouchEnd={(e) => {
                    if(touchStartX !== null && touchCurrentX !== null){
                        if(touchStartX - touchCurrentX > MIN_SWIPE_DISTANCE) {
                            for(let listener of swipeEventListeners) {
                                listener(false);
                            }
                        } else if (touchStartX - touchCurrentX < -MIN_SWIPE_DISTANCE) {
                            for(let listener of swipeEventListeners) {
                                listener(true);
                            }
                        }
                    }
            
                    setTouchStartX(null)
                    setTouchCurrentX(null)
                }}
            >
                <title>🌹{translate("menu.start.title")}🔪</title>
                <Button className="global-menu-button" 
                    onClick={() => {
                        if (!globalMenuOpen) {
                            setGlobalMenuOpen(true)
                        }
                    }}
                >
                    <Icon>menu</Icon>
                </Button>
                {globalMenuOpen && <GlobalMenu />}
                {children}
                {coverCard && <CoverCard 
                    theme={coverCardTheme}
                >{coverCard}</CoverCard>}
                {errorCard}
            </div>
        </AnchorControllerContext.Provider>
    </MobileContext.Provider>
}

let swipeEventListeners: ((right: boolean) => void)[] = [];

export function addSwipeEventListener(listener: (right: boolean) => void) {
    swipeEventListeners = [...swipeEventListeners, listener];
}
export function removeSwipeEventListener(listener: (right: boolean) => void) {
    swipeEventListeners = swipeEventListeners.filter((l) => l !== listener);
}

function CoverCard(props: Readonly<{
    children: React.ReactNode,
    theme: Theme | null
}>): ReactElement {
    const ref = useRef<HTMLDivElement>(null);
    const anchorController = useContext(AnchorControllerContext)!;

    return <div 
        className={`anchor-cover-card-background-cover ${props.theme ?? ""}`} 
        onClick={e => {
            if (e.target === ref.current) anchorController.clearCoverCard()
        }}
        ref={ref}
    >
        <div className="anchor-cover-card">
            <Button className="close-button" onClick={anchorController.clearCoverCard}>
                <Icon>close</Icon>
            </Button>
            <div className="anchor-cover-card-content">
                {props.children}
            </div>
        </div>
    </div>
}

export type ErrorData = {
    title: string,
    body: string
}

function ErrorCard(props: Readonly<{
    error: ErrorData,
    onClose: () => void
}>) {
    return <div className="error-card" onClick={() => props.onClose()}>
        <header>
            {props.error.title}
            <button className="close">✕</button>
        </header>
        <div>{props.error.body}</div>
    </div>
}


export type AudioFile = 
    "church_bell.mp3" | 
    "alarm.mp3" | 
    "vine_boom.mp3" | 
    "sniper_shot.mp3" | 
    "normal_message.mp3" | 
    "whisper_broadcast.mp3";

export type AudioFilePath = `audio/${AudioFile}`;

export function chatMessageToAudio(msg: ChatMessage): AudioFilePath | null {
    let file: AudioFile|null = null;

    switch(msg.variant.type){
        case "normal":
        case "voted":
            file = "normal_message.mp3";
            break;
        case "broadcastWhisper":
            file = "whisper_broadcast.mp3";
            break;
        case "playerDied": 
            file = "church_bell.mp3";
            break;
        case "deputyKilled": 
            file = "sniper_shot.mp3";
            break;
    }

    if(file){
        return `audio/${file}`;
    }else{
        return null
    }
}