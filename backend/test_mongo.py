import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test_mongo():
    try:
        client = AsyncIOMotorClient('mongodb://localhost:27017')
        await client.admin.command('ping')
        print('[OK] MongoDB is running and accessible')
        client.close()
        return True
    except Exception as e:
        print(f'[ERROR] MongoDB connection failed: {e}')
        print('\nPlease start MongoDB:')
        print('  - Windows: Start MongoDB service or run "mongod"')
        print('  - Mac: brew services start mongodb-community')
        print('  - Linux: sudo systemctl start mongod')
        return False

if __name__ == '__main__':
    asyncio.run(test_mongo())
