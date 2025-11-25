export default function KatalogLogo() {
    return (
        <div className="lg:fixed relative top-0 lg:w-fit w-full bg-zinc-800 lg:rounded-lg lg:m-3 lg:p-3 pt-3 pb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={"/katalog.png"} height={100} width={85} alt="Katalog logo" className="mx-auto"/>
        </div>
    )
}