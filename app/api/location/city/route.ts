import { NextRequest, NextResponse } from 'next/server';
import { getCachedData, cacheTtl } from '@/lib/cache';

async function getLocationByIp(ip: string): Promise<{ city: string; region: string }> {
  try {
    // Use a free IP geolocation service
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      throw new Error('Location service unavailable');
    }
    
    const data = await response.json();
    
    // Major Brazilian cities mapping
    const cityMap: Record<string, string> = {
      'Rio de Janeiro': 'Rio de Janeiro',
      'São Paulo': 'São Paulo',
      'Brasília': 'Brasília',
      'Salvador': 'Salvador',
      'Belo Horizonte': 'Belo Horizonte',
      'Fortaleza': 'Fortaleza',
      'Manaus': 'Manaus',
      'Curitiba': 'Curitiba',
      'Recife': 'Recife',
      'Porto Alegre': 'Porto Alegre',
      'Belém': 'Belém',
      'Goiânia': 'Goiânia',
      'Guarulhos': 'Guarulhos',
      'Campinas': 'Campinas',
      'São Luís': 'São Luís',
      'São Gonçalo': 'São Gonçalo',
      'Maceió': 'Maceió',
      'Duque de Caxias': 'Duque de Caxias',
      'Nova Iguaçu': 'Nova Iguaçu',
      'Teresina': 'Teresina',
      'Santo André': 'Santo André',
      'João Pessoa': 'João Pessoa',
      'Jaboatão dos Guararapes': 'Jaboatão dos Guararapes',
      'Osasco': 'Osasco',
      'São Bernardo do Campo': 'São Bernardo do Campo',
      'Contagem': 'Contagem',
      'Uberlândia': 'Uberlândia',
      'Sorocaba': 'Sorocaba',
      'Ribeirão Preto': 'Ribeirão Preto',
      'Aracaju': 'Aracaju',
      'Feira de Santana': 'Feira de Santana',
      'Cuiabá': 'Cuiabá',
      'Joinville': 'Joinville',
      'Aparecida de Goiânia': 'Aparecida de Goiânia',
      'Porto Velho': 'Porto Velho',
      'Serra': 'Serra',
      'Niterói': 'Niterói',
      'Campos dos Goytacazes': 'Campos dos Goytacazes',
      'São José dos Campos': 'São José dos Campos',
      'Vila Velha': 'Vila Velha',
      'Mauá': 'Mauá',
      'São José do Rio Preto': 'São José do Rio Preto',
      'Mogi das Cruzes': 'Mogi das Cruzes',
      'Diadema': 'Diadema',
      'Betim': 'Betim',
      'Jundiaí': 'Jundiaí',
      'Carapicuíba': 'Carapicuíba',
      'Piracicaba': 'Piracicaba',
      'Cariacica': 'Cariacica',
      'São Vicente': 'São Vicente',
      'Bauru': 'Bauru',
      'Itaquaquecetuba': 'Itaquaquecetuba',
      'São Leopoldo': 'São Leopoldo',
    };
    
    const city = cityMap[data.city] || data.city || 'Rio de Janeiro';
    const region = data.region || 'RJ';
    
    return { city, region };
  } catch (error) {
    console.error('Error detecting location:', error);
    return { city: 'Rio de Janeiro', region: 'RJ' };
  }
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || realIp || '8.8.8.8'; // Default to Google DNS
  return ip;
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    
    // Cache location data for 24 hours
    const location = await getCachedData(
      `location:${ip}`,
      () => getLocationByIp(ip),
      { 
        memoryTtl: cacheTtl.long, 
        redisTtl: cacheTtl.daily,
        revalidate: cacheTtl.daily
      }
    );

    return NextResponse.json(location);
  } catch (error) {
    console.error('Location API error:', error);
    
    // Fallback to Rio de Janeiro
    return NextResponse.json(
      { city: 'Rio de Janeiro', region: 'RJ' },
      { status: 200 }
    );
  }
}
