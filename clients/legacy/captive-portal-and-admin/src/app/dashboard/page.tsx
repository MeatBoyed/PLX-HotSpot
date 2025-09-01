// Must run on Server otherwise RadiusDesk requests fails
import UserSession from '@/components/welcome-page/user-session';
import InfoCard from '@/components/welcome-page/info-card';

export default function DashboardPage() {

    return (
        <div className="w-full flex flex-col">
            <div className="flex flex-col items-center justify-start" >
                <InfoCard />

                <main className="flex items-start justify-start bg-white w-full rounded-t-[20px] pt-3 pb-10 md:items-center md:justify-center max-w-md">
                    {/* {authState.userSession && ( */}
                    <UserSession
                    // status={authState.userSession}
                    // userUsage={authState.userUsage}
                    />
                    {/* )} */}
                </main>
            </div>
        </div>
    );
}
