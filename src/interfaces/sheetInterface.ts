interface TicketValues {
    id: string;
    jenisTiket: string;
    idLine: string;
    nama: string;
    noTelepon: string;
    email: string;
    asalSekolah: string;
    pilihanPertama: string;
    pilihanKedua: string;
    pilihanKetiga: string;
    buktiFollow: string;
    buktiPembayaran: string;
}

interface MerchValues {
    id: string;
    nama: string;
    idLine: string;
    noTelepon: string;
    email: string;
    alamat: string;
    kodePos: string;
    pengambilanBarang: string;
    notes: string;

    banyak_item: number;
    item: string;
    jumlah: number;
    harga: number;
    totalHarga: number;

    extraBubblewrap: number;
    ongkir: number;
    
    buktiPembayaran: string;
}

interface Merch {
    nama: string;
    jumlah: number;
    harga: number
}

export { TicketValues, MerchValues, Merch}