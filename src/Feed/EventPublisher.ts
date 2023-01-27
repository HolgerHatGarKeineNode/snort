import { useSelector } from "react-redux";

import { System } from "Nostr/System";
import { default as NEvent } from "Nostr/Event";
import EventKind from "Nostr/EventKind";
import Tag from "Nostr/Tag";
import { RootState } from "State/Store";
import { HexKey, RawEvent, u256, UserMetadata } from "Nostr";
import { MUTE_LIST_TAG } from "Feed/MuteList";
import { bech32ToHex } from "Util"
import { DefaultRelays, HashtagRegex } from "Const";

declare global {
    interface Window {
        nostr: {
            getPublicKey: () => Promise<HexKey>,
            signEvent: (event: RawEvent) => Promise<RawEvent>,
            getRelays: () => Promise<[[string, { read: boolean, write: boolean }]]>,
            nip04: {
                encrypt: (pubkey: HexKey, content: string) => Promise<string>,
                decrypt: (pubkey: HexKey, content: string) => Promise<string>
            }
        }
    }
}

export default function useEventPublisher() {
    const pubKey = useSelector<RootState, HexKey | undefined>(s => s.login.publicKey);
    const privKey = useSelector<RootState, HexKey | undefined>(s => s.login.privateKey);
    const follows = useSelector<RootState, HexKey[]>(s => s.login.follows);
    const relays = useSelector<RootState>(s => s.login.relays);
    const hasNip07 = 'nostr' in window;

    async function signEvent(ev: NEvent): Promise<NEvent> {
        if (hasNip07 && !privKey) {
            ev.Id = await ev.CreateId();
            let tmpEv = await barierNip07(() => window.nostr.signEvent(ev.ToObject()));
            return new NEvent(tmpEv);
        } else if (privKey) {
            await ev.Sign(privKey);
        } else {
            console.warn("Count not sign event, no private keys available");
        }
        return ev;
    }

    function processContent(ev: NEvent, msg: string) {
        const replaceNpub = (match: string) => {
            const npub = match.slice(1);
            try {
                const hex = bech32ToHex(npub);
                const idx = ev.Tags.length;
                ev.Tags.push(new Tag(["p", hex], idx));
                return `#[${idx}]`
            } catch (error) {
                return match
            }
        }
        const replaceNoteId = (match: string) => {
            try {
                const hex = bech32ToHex(match);
                const idx = ev.Tags.length;
                ev.Tags.push(new Tag(["e", hex, "", "mention"], idx));
                return `#[${idx}]`
            } catch (error) {
                return match
            }
        }
        const replaceHashtag = (match: string) => {
            const tag = match.slice(1);
            const idx = ev.Tags.length;
            ev.Tags.push(new Tag(["t", tag.toLowerCase()], idx));
            return match;
        }
        const content = msg.replace(/@npub[a-z0-9]+/g, replaceNpub)
          .replace(/note[a-z0-9]+/g, replaceNoteId)
          .replace(HashtagRegex, replaceHashtag);
        ev.Content = content;
    }

    return {
        broadcast: (ev: NEvent | undefined) => {
            if (ev) {
                console.debug("Sending event: ", ev);
                System.BroadcastEvent(ev);
            }
        },
        /**
         * Write event to DefaultRelays, this is important for profiles / relay lists to prevent bugs
         * If a user removes all the DefaultRelays from their relay list and saves that relay list, 
         * When they open the site again we wont see that updated relay list and so it will appear to reset back to the previous state
         */
        broadcastForBootstrap: (ev: NEvent | undefined) => {
            if(ev) {
                for(let [k, _] of DefaultRelays) {
                    System.WriteOnceToRelay(k, ev);
                }
            }
        },
        muted: async (keys: HexKey[]) => {
            if (pubKey) {
                let ev = NEvent.ForPubKey(pubKey);
                ev.Kind = EventKind.Lists;
                ev.Tags.push(new Tag(["d", MUTE_LIST_TAG], ev.Tags.length))
                keys.forEach(p => {
                  ev.Tags.push(new Tag(["p", p], ev.Tags.length))
                })
                // todo: public/private block
                ev.Content = "";
                return await signEvent(ev);
            }
        },
        metadata: async (obj: UserMetadata) => {
            if (pubKey) {
                let ev = NEvent.ForPubKey(pubKey);
                ev.Kind = EventKind.SetMetadata;
                ev.Content = JSON.stringify(obj);
                return await signEvent(ev);
            }
        },
        note: async (msg: string) => {
            if (pubKey) {
                let ev = NEvent.ForPubKey(pubKey);
                ev.Kind = EventKind.TextNote;
                processContent(ev, msg);
                return await signEvent(ev);
            }
        },
        /**
         * Reply to a note
         */
        reply: async (replyTo: NEvent, msg: string) => {
            if (pubKey) {
                let ev = NEvent.ForPubKey(pubKey);
                ev.Kind = EventKind.TextNote;

                let thread = replyTo.Thread;
                if (thread) {
                    if (thread.Root || thread.ReplyTo) {
                        ev.Tags.push(new Tag(["e", thread.Root?.Event ?? thread.ReplyTo?.Event!, "", "root"], ev.Tags.length));
                    }
                    ev.Tags.push(new Tag(["e", replyTo.Id, "", "reply"], ev.Tags.length));

                    // dont tag self in replies
                    if (replyTo.PubKey !== pubKey) {
                        ev.Tags.push(new Tag(["p", replyTo.PubKey], ev.Tags.length));
                    }

                    for (let pk of thread.PubKeys) {
                        if (pk === pubKey) {
                            continue; // dont tag self in replies
                        }
                        ev.Tags.push(new Tag(["p", pk], ev.Tags.length));
                    }
                } else {
                    ev.Tags.push(new Tag(["e", replyTo.Id, "", "reply"], 0));
                    // dont tag self in replies
                    if (replyTo.PubKey !== pubKey) {
                        ev.Tags.push(new Tag(["p", replyTo.PubKey], ev.Tags.length));
                    }
                }
                processContent(ev, msg);
                return await signEvent(ev);
            }
        },
        react: async (evRef: NEvent, content = "+") => {
            if (pubKey) {
                let ev = NEvent.ForPubKey(pubKey);
                ev.Kind = EventKind.Reaction;
                ev.Content = content;
                ev.Tags.push(new Tag(["e", evRef.Id], 0));
                ev.Tags.push(new Tag(["p", evRef.PubKey], 1));
                return await signEvent(ev);
            }
        },
        saveRelays: async () => {
            if (pubKey) {
                let ev = NEvent.ForPubKey(pubKey);
                ev.Kind = EventKind.ContactList;
                ev.Content = JSON.stringify(relays);
                for (let pk of follows) {
                    ev.Tags.push(new Tag(["p", pk], ev.Tags.length));
                }

                return await signEvent(ev);
            }
        },
        addFollow: async (pkAdd: HexKey | HexKey[]) => {
            if (pubKey) {
                let ev = NEvent.ForPubKey(pubKey);
                ev.Kind = EventKind.ContactList;
                ev.Content = JSON.stringify(relays);
                let temp = new Set(follows);
                if (Array.isArray(pkAdd)) {
                    pkAdd.forEach(a => temp.add(a));
                } else {
                    temp.add(pkAdd);
                }
                for (let pk of temp) {
                    ev.Tags.push(new Tag(["p", pk], ev.Tags.length));
                }

                return await signEvent(ev);
            }
        },
        removeFollow: async (pkRemove: HexKey) => {
            if (pubKey) {
                let ev = NEvent.ForPubKey(pubKey);
                ev.Kind = EventKind.ContactList;
                ev.Content = JSON.stringify(relays);
                for (let pk of follows) {
                    if (pk === pkRemove) {
                        continue;
                    }
                    ev.Tags.push(new Tag(["p", pk], ev.Tags.length));
                }

                return await signEvent(ev);
            }
        },
        /**
         * Delete an event (NIP-09)
         */
        delete: async (id: u256) => {
            if (pubKey) {
                let ev = NEvent.ForPubKey(pubKey);
                ev.Kind = EventKind.Deletion;
                ev.Content = "";
                ev.Tags.push(new Tag(["e", id], 0));
                return await signEvent(ev);
            }
        },
        /**
         * Respot a note (NIP-18)
         */
        repost: async (note: NEvent) => {
            if (pubKey) {
                let ev = NEvent.ForPubKey(pubKey);
                ev.Kind = EventKind.Repost;
                ev.Content = JSON.stringify(note.Original);
                ev.Tags.push(new Tag(["e", note.Id], 0));
                ev.Tags.push(new Tag(["p", note.PubKey], 1));
                return await signEvent(ev);
            }
        },
        decryptDm: async (note: NEvent): Promise<string | undefined> => {
            if (pubKey) {
                if (note.PubKey !== pubKey && !note.Tags.some(a => a.PubKey === pubKey)) {
                    return "<CANT DECRYPT>";
                }
                try {
                    let otherPubKey = note.PubKey === pubKey ? note.Tags.filter(a => a.Key === "p")[0].PubKey! : note.PubKey;
                    if (hasNip07 && !privKey) {
                        return await barierNip07(() => window.nostr.nip04.decrypt(otherPubKey, note.Content));
                    } else if (privKey) {
                        await note.DecryptDm(privKey, otherPubKey);
                        return note.Content;
                    }
                } catch (e) {
                    console.error("Decyrption failed", e);
                    return "<DECRYPTION FAILED>";
                }
            }
        },
        sendDm: async (content: string, to: HexKey) => {
            if (pubKey) {
                let ev = NEvent.ForPubKey(pubKey);
                ev.Kind = EventKind.DirectMessage;
                ev.Content = content;
                ev.Tags.push(new Tag(["p", to], 0));

                try {
                    if (hasNip07 && !privKey) {
                        let cx: string = await barierNip07(() => window.nostr.nip04.encrypt(to, content));
                        ev.Content = cx;
                        return await signEvent(ev);
                    } else if (privKey) {
                        await ev.EncryptDmForPubkey(to, privKey);
                        return await signEvent(ev);
                    }
                } catch (e) {
                    console.error("Encryption failed", e);
                }
            }
        }
    }
}

let isNip07Busy = false;

const delay = (t: number) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, t);
    });
}

const barierNip07 = async (then: () => Promise<any>) => {
    while (isNip07Busy) {
        await delay(10);
    }
    isNip07Busy = true;
    try {
        return await then();
    } finally {
        isNip07Busy = false;
    }
};
