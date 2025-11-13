# Database Setup Guide

## Supabase Connection Configuration

This application is configured to work with Supabase PostgreSQL databases, particularly optimized for serverless deployments on Vercel.

### Issue: Random Database Connection Errors

If you're experiencing intermittent errors like:
```
Can't reach database server at `aws-0-sa-east-1.pooler.supabase.com`:`5432`
```

This is typically caused by connection exhaustion in serverless environments.

### Solution: Use Connection Pooling

#### 1. Configure Supabase Connection String

In Supabase, there are two types of connection strings:

**Direct Connection (Port 5432)** - ❌ Not recommended for serverless
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Connection Pooler (Port 6543)** - ✅ Recommended for serverless
```
postgresql://postgres:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### 2. Set Environment Variables

In your Vercel project settings or `.env` file, set:

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Important Notes:**
- Use **port 6543** (not 5432) for the connection pooler
- Add `?pgbouncer=true` parameter to the connection string
- The application automatically adds connection pooling parameters

#### 3. Supabase Dashboard Steps

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Under **Connection String**, select **Connection pooling**
4. Copy the **Connection pooling** string (uses port 6543)
5. Use this in your `DATABASE_URL` environment variable

### Vercel Deployment

When deploying to Vercel:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Update `DATABASE_URL` with the connection pooler string
3. Redeploy your application

### Why This Works

- **Connection Pooling**: pgBouncer manages connections efficiently
- **Transaction Mode**: Supabase's pooler uses transaction mode by default
- **Connection Limits**: The application limits connections to 1 per serverless function
- **Timeouts**: Connection attempts timeout after 10 seconds to prevent hanging

### Free Tier Limitations

Supabase free tier has:
- Limited concurrent connections (around 3-10)
- Connection pooling helps manage these limits
- Using the pooler is essential for serverless deployments

### Testing

After updating the connection string:
1. Redeploy your application
2. Try generating a report multiple times
3. Monitor for any connection errors
4. Check Vercel function logs for any issues

### Troubleshooting

If you still experience issues:

1. **Verify the connection string**: Ensure you're using port 6543 with `pgbouncer=true`
2. **Check Supabase status**: Visit Supabase status page
3. **Review Vercel logs**: Check for specific error messages
4. **Consider upgrading**: Free tier has stricter limits
5. **Monitor connection usage**: Check Supabase dashboard for connection stats

### Additional Resources

- [Prisma + Supabase Best Practices](https://supabase.com/docs/guides/integrations/prisma)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
