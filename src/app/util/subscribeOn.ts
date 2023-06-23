import { Subscription } from 'rxjs/Subscription';

export function subscribeOn(sub: Subscription) {
    return () => {
        sub.unsubscribe();
    };
};