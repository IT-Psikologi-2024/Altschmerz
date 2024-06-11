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
    order: string;
    totalHarga: number;
    buktiPembayaran: string;
}

interface Merch {
    nama: string;
    jumlah: number;
}

export { TicketValues, MerchValues, Merch}