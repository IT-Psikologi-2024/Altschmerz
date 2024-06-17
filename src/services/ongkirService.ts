import { Request, Response } from 'express';

const getProvince = async (req: Request, res: Response) => {
    try {
        const provinceUrl = process.env.ONGKIR_URL + "/province";
        const response = await fetch(provinceUrl, {
            method: "GET",
            headers: {
              "Key": process.env.ONGKIR_API_KEY,
              "Content-Type": "application/json"
            },
          });
          
          const result = await response.json();
          const province = result.rajaongkir.results

        res.status(200).json(province);
    } catch (e) {
        console.error('Error while fetching province:', e.message);
        res.status(500).json({ error: 'Error while fetching province: ' + e.message });
    }
};

const getCity = async (req: Request, res: Response) => {
    try {
        const provinceId = req.params.id

        const provinceUrl = process.env.ONGKIR_URL + "/city?province=" + provinceId;
        const response = await fetch(provinceUrl, {
            method: "GET",
            headers: {
              "Key": process.env.ONGKIR_API_KEY,
              "Content-Type": "application/json"
            },
          });
          
          const result = await response.json();
          const cities = result.rajaongkir.results.map((city: any) => {
                return {city_id : city.city_id, city_name: `${city.type} ${city.city_name}`}
            })

        res.status(200).json(cities);
    } catch (e) {
        console.error('Error while fetching city:', e.message);
        res.status(500).json({ error: 'Error while fetching city: ' + e.message });
    }
};

const getOngkir = async (req: Request, res: Response) => {
    try {
        const cityId = req.params.id
        const provinceUrl = process.env.ONGKIR_URL + "/cost"

        const data = {
            origin: 153, // Jakarta Selatan
            destination: cityId,
            weight: 500, // 500g
            courier: 'jne'
        }

        const response = await fetch(provinceUrl, {
            method: "POST",
            headers: {
              "Key": process.env.ONGKIR_API_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
          });
          
          const result = await response.json();
          const cost = result.rajaongkir.results[0].costs[1].cost[0].value // JNE Reg
          
        res.status(200).json({cost});
    } catch (e) {
        console.error('Error while fetching ongkir:', e.message);
        res.status(500).json({ error: 'Error while fetching ongkir: ' + e.message });
    }
};

export { getProvince, getCity, getOngkir }