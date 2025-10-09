using Microsoft.EntityFrameworkCore;
using ReviewKhoaHoc.Database;
using ReviewKhoaHoc.Interfaces;

namespace ReviewKhoaHoc.Repositories
{
    public class RepositoryFactory : IRepositoryFactory, IDisposable
    {
        private readonly IDbContextFactory<AppDbContext> _dbContextFactory;
        private AppDbContext? _context;

        public RepositoryFactory(IDbContextFactory<AppDbContext> dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        private AppDbContext Context
        {
            get
            {
                if (_context == null)
                {
                    _context = _dbContextFactory.CreateDbContext();
                }
                return _context;
            }
        }

        public IGenericRepository<T> CreateRepository<T>() where T : class
        {
            return new GenericRepository<T>(Context);
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }

}
