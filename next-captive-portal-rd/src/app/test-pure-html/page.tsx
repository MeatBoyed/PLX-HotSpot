import PureHtmlConnectCard from '@/components/home-page/pure-html-connect-card';
import { requireAuth } from '@/lib/auth/auth-service';
import { seedAuthState } from '@/lib/seed';
import { appConfig } from '@/lib/config';
import Head from '@/components/home-page/head';

export default async function TestPureHtmlPage() {
    let authState = null;

    if (appConfig.useSeedData) {
        authState = seedAuthState;
    } else {
        authState = await requireAuth();
    }

    return (
        <>
            <nav className="flex items-center justify-center w-full">
                <Head />
            </nav>
            <main className="flex items-center justify-center min-h-screen">
                <div className="p-4 w-full max-w-md">
                    <div className="mb-4 text-center">
                        <h1 className="text-2xl font-bold mb-2">Pure HTML Form Test</h1>
                        <p className="text-sm opacity-75">
                            This form submits directly to MikroTik without JavaScript iframe handling
                        </p>
                    </div>

                    <PureHtmlConnectCard mikrotikLoginUrl={authState.mikrotikData?.loginlink} />

                    <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
                        <h3 className="font-semibold mb-2">How it works:</h3>
                        <ul className="space-y-1 text-xs">
                            <li>• Form submits directly to MikroTik login URL</li>
                            <li>• Uses GET method with credentials in URL params</li>
                            <li>• Browser navigates to MikroTik response page</li>
                            <li>• No CORS issues - standard form behavior</li>
                            <li>• No JavaScript manipulation of response</li>
                        </ul>
                    </div>
                </div>
            </main>
        </>
    );
}
